// Live integration check for reserve_ask_attempt() / migration 0009.
//
// Why this lives here and not as a apps/web/**/*.test.ts file: CI's "web"
// job runs `npm run test` with no database at all (see .github/workflows/
// ci.yml). A test that needs a live Postgres would fail there every time,
// for every future PR, not just this one. supabase/tests/ is this repo's
// existing home for checks that need a real database -- see
// btb_rls_check.py -- so this follows that same convention instead of
// inventing a second one.
//
// It runs in CI as part of the "ask-limiter" job, against a throwaway local
// `supabase start` -- the keys are the CLI's public local defaults, so no
// repository secret is involved (btb_rls_check.py's shared-project job has
// no privileged secret, and this does not change that). To run it by hand:
//   SUPABASE_URL=... SUPABASE_SECRET_KEY=... \
//     node --experimental-strip-types supabase/tests/ask_rate_limit_check.ts
//
// It creates and deletes users, so it refuses to run against anything but a
// local Supabase.
//
// What this proves: the limit boundary (below/at/above), that two parents'
// counters are independent, and that concurrent requests cannot both slip
// through past the limit. The 429 status, the audit rows and the health
// redirect exemption live in the Next.js route, not in this RPC; those are
// covered by ask_route_check.ts.

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

function loadLocalEnv(): void {
  for (const path of ['.env.local', '../.env.local']) {
    let text: string;
    try {
      text = readFileSync(path, 'utf8');
    } catch {
      continue;
    }
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
      const [name, ...rest] = trimmed.split('=');
      const value = rest.join('=').trim().replace(/^['"]|['"]$/g, '');
      if (!(name in process.env)) process.env[name] = value;
    }
    return;
  }
}

function requiredEnv(...names: string[]): string {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }
  throw new Error(`Missing required environment setting: ${names.join(' or ')}`);
}

loadLocalEnv();

const url = requiredEnv('SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL');
const secretKey = requiredEnv('SUPABASE_SECRET_KEY');

// A stray .env.local can point at the shared dev project, and this script
// creates and deletes users.
const host = new URL(url).hostname;
if (!['127.0.0.1', 'localhost', '::1', '[::1]'].includes(host)) {
  throw new Error(
    `Refusing to run: the Supabase URL host is "${host}". This check only runs against a local Supabase.`,
  );
}
const supabase = createClient(url, secretKey);

let failures = 0;

function report(pass: boolean, label: string): void {
  console.log(`${pass ? 'PASS' : 'FAIL'} ${label}`);
  if (!pass) failures += 1;
}

interface Fixture {
  userId: string;
  parentId: string;
}

async function makeParent(label: string): Promise<Fixture> {
  const userId = randomUUID();
  const { error: userError } = await supabase.auth.admin.createUser({
    // A caller-supplied id keeps this script able to clean up its own
    // fixtures without a lookup step.
    id: userId,
    email: `ask-rate-limit-check-${userId}@example.com`,
    email_confirm: true,
  });
  if (userError) throw new Error(`could not create fixture user for ${label}: ${userError.message}`);

  const { data: parent, error: parentError } = await supabase
    .from('parent_profiles')
    .insert({ user_id: userId, full_name: label })
    .select('id')
    .single();
  if (parentError || !parent) {
    throw new Error(`could not create fixture parent for ${label}: ${parentError?.message}`);
  }

  // cleanup() deletes by auth.users id, not parent_profiles id -- keep both,
  // a prior version of this script conflated the two and left every fixture
  // behind with the failure silently swallowed.
  return { userId, parentId: parent.id };
}

async function reserve(parentId: string, maxPerDay: number): Promise<boolean> {
  const { data, error } = await supabase.rpc('reserve_ask_attempt', {
    p_parent_id: parentId,
    p_max_per_day: maxPerDay,
  });
  if (error) throw new Error(`reserve_ask_attempt failed: ${error.message}`);
  return data as boolean;
}

async function cleanup(fixtures: Fixture[]): Promise<void> {
  for (const { userId } of fixtures) {
    // Cascades to parent_profiles -> ask_daily_usage.
    const { error } = await supabase.auth.admin.deleteUser(userId);
    // Silently swallowing this once already hid every fixture this script
    // ever left behind -- report it instead of hoping it never happens.
    if (error) console.error(`FAIL cleanup: could not delete fixture user ${userId}: ${error.message}`);
  }
}

async function main(): Promise<void> {
  const fixtures: Fixture[] = [];

  try {
    console.log('\nBoundary: below, at, and above the limit');
    const parentA = await makeParent('Rate Limit Check A');
    fixtures.push(parentA);
    const results: boolean[] = [];
    for (let i = 0; i < 4; i++) {
      results.push(await reserve(parentA.parentId, 3));
    }
    report(
      JSON.stringify(results) === JSON.stringify([true, true, true, false]),
      `first 3 of 4 allowed at max_per_day=3, got ${JSON.stringify(results)}`,
    );

    console.log('\nIndependence: a second parent is unaffected by the first');
    const parentB = await makeParent('Rate Limit Check B');
    fixtures.push(parentB);
    const firstForB = await reserve(parentB.parentId, 3);
    report(firstForB === true, 'a fresh parent\'s first attempt is allowed even though another parent is already over their limit');

    console.log('\nConcurrency: N simultaneous requests never let more than the limit through');
    const parentC = await makeParent('Rate Limit Check C');
    fixtures.push(parentC);
    const CONCURRENT = 25;
    const LIMIT = 10;
    const outcomes = await Promise.all(
      Array.from({ length: CONCURRENT }, () => reserve(parentC.parentId, LIMIT)),
    );
    const allowedCount = outcomes.filter(Boolean).length;
    report(
      allowedCount === LIMIT,
      `exactly ${LIMIT} of ${CONCURRENT} concurrent requests allowed, got ${allowedCount}`,
    );
  } finally {
    await cleanup(fixtures);
  }

  console.log(failures === 0 ? '\nRESULT: ALL CHECKS PASSED' : `\nRESULT: ${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('\nError:', err instanceof Error ? err.message : err);
  process.exit(1);
});
