import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

/**
 * Records a parent's thumbs up / thumbs down on an Ask answer.
 *
 * No ownership check is written here on purpose. ai_messages carries the
 * "own messages" RLS policy FOR ALL, scoped through ai_conversations to the
 * signed-in parent, so an update against someone else's message matches no
 * row and affects nothing. Re-implementing that check in application code
 * would just be a second, weaker copy of it.
 */
export async function POST(request: Request) {
  const supabase = await createServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { messageId?: unknown; feedback?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // null clears a rating she taps a second time.
  const valid = body.feedback === 1 || body.feedback === -1 || body.feedback === null;

  if (typeof body.messageId !== 'string' || !valid) {
    return NextResponse.json(
      { error: 'messageId and a feedback of 1, -1 or null are required' },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from('ai_messages')
    .update({ feedback: body.feedback })
    .eq('id', body.messageId)
    .eq('role', 'assistant')
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('[ask/feedback] Update failed:', error.message);
    return NextResponse.json({ error: 'Could not save that.' }, { status: 500 });
  }

  // No row means RLS filtered it out or the id was not an assistant turn.
  // Same answer either way; do not tell a caller which.
  if (!data) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
