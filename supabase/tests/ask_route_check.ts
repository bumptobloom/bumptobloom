// Route-level check for POST /api/ask: rate limiting, audit events, and the
// health-redirect exemption, driven over real HTTP against a real (local)
// Supabase, with a fake OpenAI that always rejects the request.
//
// Needs: a running Next.js app pointed at the same local Supabase and at
// this script's fake OpenAI (OPENAI_BASE_URL=http://127.0.0.1:<FAKE_OPENAI_PORT>/v1).
// The "ask-limiter" job in .github/workflows/ci.yml sets all of that up on a
// throwaway `supabase start`, so no real secret is involved -- the keys are
// the CLI's public local defaults.
//
// It creates and deletes users, so it refuses to run against anything but a
// local Supabase. A stray .env.local pointing at the shared dev project must
// never be able to reach this.
//
// Settings (all from the environment):
//   SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY  -- local stack
//   APP_URL           default http://127.0.0.1:3000
//   FAKE_OPENAI_PORT  default 9999

import { createServer } from 'node:http';
import type { Server } from 'node:http';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

// Must match RATE_LIMIT_MAX_QUESTIONS_PER_DAY in
// apps/web/src/lib/ask/rate-limit.ts. Duplicated on purpose: that module is
// server-only and cannot be imported from here. If the two drift, this check
// fails, so changing the limit becomes a deliberate edit in both places.
const DAILY_LIMIT = 10;

const HEALTH_QUESTION = 'My baby has a fever, what should I do?';

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment setting: ${name}`);
  return value;
}

const supabaseUrl = requiredEnv('SUPABASE_URL');
const publishableKey = requiredEnv('SUPABASE_PUBLISHABLE_KEY');
const secretKey = requiredEnv('SUPABASE_SECRET_KEY');
const appUrl = (process.env.APP_URL ?? 'http://127.0.0.1:3000').replace(/\/$/, '');
const fakeOpenAIPort = Number(process.env.FAKE_OPENAI_PORT ?? '9999');

const host = new URL(supabaseUrl).hostname;
if (!['127.0.0.1', 'localhost', '::1', '[::1]'].includes(host)) {
  throw new Error(
    `Refusing to run: SUPABASE_URL host is "${host}". This check creates and deletes users and ` +
      'only runs against a local Supabase.',
  );
}

const admin = createClient(supabaseUrl, secretKey);

let failures = 0;

function report(pass: boolean, label: string): void {
  console.log(`${pass ? 'PASS' : 'FAIL'} ${label}`);
  if (!pass) failures += 1;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// A fake OpenAI that always rejects, quoting the parent's own question back
// in its message -- the exact leak the audit sanitization exists to stop.
let providerCalls = 0;

function startFakeOpenAI(port: number): Promise<Server> {
  const server = createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      providerCalls += 1;
      let question = '';
      try {
        const messages = JSON.parse(body).messages as { role: string; content: string }[];
        question = messages.filter((m) => m.role === 'user').pop()?.content ?? '';
      } catch {
        // an unparseable body just gets an empty quote
      }
      res.writeHead(400, { 'content-type': 'application/json' });
      res.end(
        JSON.stringify({
          error: {
            message: `Rejected by moderation: "${question}"`,
            code: 'content_policy_violation',
            type: 'invalid_request_error',
          },
        }),
      );
    });
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}

// Signs in through @supabase/ssr with an in-memory cookie jar, so the cookie
// name and format are exactly what the app itself expects.
async function signInCookie(email: string, password: string): Promise<string> {
  const jar = new Map<string, string>();
  const client = createServerClient(supabaseUrl, publishableKey, {
    cookies: {
      getAll: () => [...jar].map(([name, value]) => ({ name, value })),
      setAll: (cookies: { name: string; value: string }[]) => {
        for (const { name, value } of cookies) jar.set(name, value);
      },
    },
  });

  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`sign-in failed: ${error.message}`);

  // setAll is driven by an auth-state callback, so it can land a tick later.
  for (let i = 0; i < 30 && jar.size === 0; i++) await sleep(100);
  if (jar.size === 0) throw new Error('sign-in produced no session cookies');

  return [...jar].map(([name, value]) => `${name}=${value}`).join('; ');
}

interface AskResult {
  status: number;
  body: { error?: unknown; redirectedToHealth?: unknown } | null;
}

async function ask(cookie: string, babyId: string, question: string): Promise<AskResult> {
  const res = await fetch(`${appUrl}/api/ask`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify({ babyId, question }),
    signal: AbortSignal.timeout(30_000),
  });
  let body: AskResult['body'] = null;
  try {
    body = await res.json();
  } catch {
    // leave null: a non-JSON body is itself worth failing a check on
  }
  return { status: res.status, body };
}

async function usageCount(parentId: string): Promise<number> {
  const { data, error } = await admin
    .from('ask_daily_usage')
    .select('request_count')
    .eq('parent_id', parentId);
  if (error) throw new Error(`could not read ask_daily_usage: ${error.message}`);
  return (data ?? []).reduce((sum, row) => sum + row.request_count, 0);
}

async function aiRunsCount(parentId: string): Promise<number> {
  const { data: conversations, error: convError } = await admin
    .from('ai_conversations')
    .select('id')
    .eq('parent_id', parentId);
  if (convError) throw new Error(`could not read ai_conversations: ${convError.message}`);
  const conversationIds = (conversations ?? []).map((row) => row.id);
  if (conversationIds.length === 0) return 0;

  const { data: messages, error: msgError } = await admin
    .from('ai_messages')
    .select('id')
    .in('conversation_id', conversationIds);
  if (msgError) throw new Error(`could not read ai_messages: ${msgError.message}`);
  const messageIds = (messages ?? []).map((row) => row.id);
  if (messageIds.length === 0) return 0;

  const { count, error: runError } = await admin
    .from('ai_runs')
    .select('id', { count: 'exact', head: true })
    .in('message_id', messageIds);
  if (runError) throw new Error(`could not read ai_runs: ${runError.message}`);
  return count ?? 0;
}

async function main(): Promise<void> {
  const fakeOpenAI = await startFakeOpenAI(fakeOpenAIPort);

  const email = `ask-route-check-${randomUUID()}@example.com`;
  const password = randomUUID();
  let userId: string | null = null;

  try {
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createError || !created.user) {
      throw new Error(`could not create fixture user: ${createError?.message}`);
    }
    userId = created.user.id;

    const { data: parent, error: parentError } = await admin
      .from('parent_profiles')
      .insert({ user_id: userId, full_name: 'Ask Route Check' })
      .select('id')
      .single();
    if (parentError || !parent) {
      throw new Error(`could not create fixture parent: ${parentError?.message}`);
    }

    const birthDate = new Date();
    birthDate.setMonth(birthDate.getMonth() - 6);
    const { data: baby, error: babyError } = await admin
      .from('babies')
      .insert({
        parent_id: parent.id,
        name: 'Route Check Baby',
        birth_date: birthDate.toISOString().slice(0, 10),
      })
      .select('id')
      .single();
    if (babyError || !baby) {
      throw new Error(`could not create fixture baby: ${babyError?.message}`);
    }

    const cookie = await signInCookie(email, password);
    // Digits only, so the marker can never be mistaken for a symptom keyword by the triage guard.
    const marker = `MARKER${Date.now()}`;
    const normalQuestion = `How much should my baby sleep? ${marker}`;

    console.log('\nHealth redirects are exempt from the budget');
    const redirects: AskResult[] = [];
    for (let i = 0; i < DAILY_LIMIT + 2; i++) {
      redirects.push(await ask(cookie, baby.id, HEALTH_QUESTION));
    }
    report(
      redirects.every((r) => r.status === 200 && r.body?.redirectedToHealth === true),
      `${redirects.length} health questions (more than the limit of ${DAILY_LIMIT}) all returned 200 with redirectedToHealth`,
    );
    report(
      (await usageCount(parent.id)) === 0,
      'health redirects consumed none of the daily budget',
    );

    console.log('\nFailed provider attempts consume the budget');
    const failed: AskResult[] = [];
    for (let i = 0; i < DAILY_LIMIT; i++) {
      failed.push(await ask(cookie, baby.id, normalQuestion));
    }
    report(
      failed.every((r) => r.status === 502),
      `${DAILY_LIMIT} normal questions each got 502 from the failing provider`,
    );
    report(
      (await usageCount(parent.id)) === DAILY_LIMIT,
      `daily budget shows ${DAILY_LIMIT} used`,
    );
    report(
      (await aiRunsCount(parent.id)) === 0,
      'no ai_runs rows exist -- the old ai_runs-based limiter would never have limited this parent',
    );
    report(providerCalls === DAILY_LIMIT, `provider was called ${providerCalls} times, expected ${DAILY_LIMIT}`);

    console.log('\nThe next normal request is limited');
    const limited = await ask(cookie, baby.id, normalQuestion);
    report(limited.status === 429, `request ${DAILY_LIMIT + 1} returned ${limited.status}, expected 429`);
    // Status is part of this check: any other error body (a 502's, say) is
    // also digit-free, so the body alone would pass for the wrong response.
    report(
      limited.status === 429 &&
        typeof limited.body?.error === 'string' &&
        !/\d/.test(limited.body.error),
      '429 body is a plain message with no limit or window in it',
    );
    report(
      providerCalls === DAILY_LIMIT,
      'the limited request never reached the provider (no paid call made)',
    );

    console.log('\nHealth redirects still work once the budget is spent');
    const usageBefore = await usageCount(parent.id);
    const redirectAtLimit = await ask(cookie, baby.id, HEALTH_QUESTION);
    report(
      redirectAtLimit.status === 200 && redirectAtLimit.body?.redirectedToHealth === true,
      'a health question at the limit still returns 200 with redirectedToHealth',
    );
    report(
      (await usageCount(parent.id)) === usageBefore,
      'and it consumed no further budget',
    );

    console.log('\nAudit events are written and carry no provider text');
    const { data: events, error: eventsError } = await admin
      .from('audit_events')
      .select('event_type, entity, entity_id, payload')
      .eq('actor_user_id', userId);
    if (eventsError) throw new Error(`could not read audit_events: ${eventsError.message}`);
    const rows = events ?? [];

    const rateLimited = rows.filter((r) => r.event_type === 'ask_rate_limited');
    report(
      rateLimited.length === 1 &&
        JSON.stringify(rateLimited[0].payload) === '{}' &&
        rateLimited[0].entity_id === null,
      'exactly one ask_rate_limited event, with an empty payload and no conversation',
    );

    const upstream = rows.filter((r) => r.event_type === 'ask_upstream_error');
    report(
      upstream.length === DAILY_LIMIT &&
        upstream.every(
          (r) =>
            JSON.stringify(r.payload) ===
            JSON.stringify({ code: 'content_policy_violation', status: 400, errorKind: 'api' }),
        ),
      `${DAILY_LIMIT} ask_upstream_error events, each holding only error kind, status and code`,
    );

    const everything = JSON.stringify(rows);
    report(
      !everything.includes(marker) && !everything.toLowerCase().includes('moderation'),
      "the provider's echo of the parent's question appears in no audit row",
    );
  } finally {
    if (userId) {
      // audit_events.actor_user_id has no foreign key, so deleting the user
      // does not remove these -- clear them explicitly.
      const { error: auditError } = await admin.from('audit_events').delete().eq('actor_user_id', userId);
      if (auditError) console.error(`FAIL cleanup: audit_events: ${auditError.message}`);

      // Cascades to parent_profiles, conversations, messages, runs and usage.
      const { error: userError } = await admin.auth.admin.deleteUser(userId);
      if (userError) console.error(`FAIL cleanup: could not delete fixture user ${userId}: ${userError.message}`);
    }
    fakeOpenAI.close();
  }

  console.log(failures === 0 ? '\nRESULT: ALL CHECKS PASSED' : `\nRESULT: ${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('\nError:', err instanceof Error ? err.message : err);
  process.exit(1);
});
