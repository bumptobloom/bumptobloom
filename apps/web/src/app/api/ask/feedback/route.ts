import { NextResponse } from 'next/server';

import { createServerClient } from '@/lib/supabase';

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

  const valid =
    body.feedback === 1 ||
    body.feedback === -1 ||
    body.feedback === null;

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

  if (!data) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
