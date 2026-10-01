import { NextResponse } from 'next/server';

import {
  deleteConversation,
  getConversation,
  renameConversation,
  setConversationPinned,
} from '@/lib/api/conversations';

type RouteContext = {
  params: Promise<{
    conversationId: string;
  }>;
};


export async function GET(
  _request: Request,
  context: RouteContext,
) {
  const { conversationId } = await context.params;

  if (!conversationId) {
    return NextResponse.json(
      { error: 'Conversation ID is required' },
      { status: 400 },
    );
  }

  try {
    const conversation = await getConversation(conversationId);

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('[ask/conversations] Fetch failed:', error);
    return NextResponse.json(
      { error: 'Could not load that conversation.' },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext,
) {
  const { conversationId } = await context.params;

  if (!conversationId) {
    return NextResponse.json(
      { error: 'Conversation ID is required' },
      { status: 400 },
    );
  }

  let body: {
    action?: unknown;
    title?: unknown;
    isPinned?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  if (body.action === 'rename') {
    if (typeof body.title !== 'string') {
      return NextResponse.json(
        { error: 'A title is required' },
        { status: 400 },
      );
    }

    const title = body.title.trim();

    if (!title) {
      return NextResponse.json(
        { error: 'A title is required' },
        { status: 400 },
      );
    }

    if (title.length > 100) {
      return NextResponse.json(
        { error: 'Title must be 100 characters or fewer' },
        { status: 400 },
      );
    }

    try {
      const conversation = await renameConversation(conversationId, title);
      return NextResponse.json({ conversation });
    } catch (error) {
      if (error instanceof Error && error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error instanceof Error && error.message === 'Conversation not found') {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 },
        );
      }

      console.error('[ask/conversations] Rename failed:', error);
      return NextResponse.json(
        { error: 'Could not rename that conversation.' },
        { status: 500 },
      );
    }
  }

  if (body.action === 'pin') {
    if (typeof body.isPinned !== 'boolean') {
      return NextResponse.json(
        { error: 'isPinned must be a boolean' },
        { status: 400 },
      );
    }

    try {
      const conversation = await setConversationPinned(
        conversationId,
        body.isPinned,
      );

      return NextResponse.json({ conversation });
    } catch (error) {
      if (error instanceof Error && error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error instanceof Error && error.message === 'Conversation not found') {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 },
        );
      }

      console.error('[ask/conversations] Pin update failed:', error);
      return NextResponse.json(
        { error: 'Could not update that conversation.' },
        { status: 500 },
      );
    }
  }

  return NextResponse.json(
    { error: 'Unsupported conversation action' },
    { status: 400 },
  );
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
) {
  const { conversationId } = await context.params;

  if (!conversationId) {
    return NextResponse.json(
      { error: 'Conversation ID is required' },
      { status: 400 },
    );
  }

  try {
    await deleteConversation(conversationId);
    return NextResponse.json({ ok: true });
  } catch (error) {
      if (error instanceof Error && error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    if (error instanceof Error && error.message === 'Conversation not found') {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 },
      );
    }

    console.error('[ask/conversations] Delete failed:', error);
    return NextResponse.json(
      { error: 'Could not delete that conversation.' },
      { status: 500 },
    );
  }
}
