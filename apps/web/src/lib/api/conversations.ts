import { createServerClient } from '@/lib/supabase';

import type {
  ConversationHistory,
  ConversationMessage,
  ConversationMessageRole,
  ConversationSummary,
} from './types';

const CONVERSATION_COLUMNS = 'id, baby_id, title, created_at';
const MESSAGE_COLUMNS = 'id, conversation_id, role, content, created_at';

async function requireUser(
  supabase: Awaited<ReturnType<typeof createServerClient>>
) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Authentication required');
  }

  return user;
}

function toConversationSummary(row: {
  id: string;
  baby_id: string | null;
  title: string | null;
  created_at: string;
}): ConversationSummary {
  return {
    id: row.id,
    babyId: row.baby_id,
    title: row.title,
    createdAt: row.created_at,
  };
}

function toConversationMessage(row: {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  created_at: string;
}): ConversationMessage {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    role: row.role as ConversationMessageRole,
    content: row.content,
    createdAt: row.created_at,
  };
}

export async function createConversation(
  babyId?: string | null,
  title?: string | null
): Promise<ConversationSummary> {
  const supabase = await createServerClient();
  const user = await requireUser(supabase);

  const { data: parent, error: parentError } = await supabase
    .from('parent_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (parentError) {
    console.error('[createConversation] Database error fetching parent profile');
    throw new Error(
      `Database error fetching parent profile: ${parentError.message}`
    );
  }

  const { data: conversation, error } = await supabase
    .from('ai_conversations')
    .insert({
      parent_id: parent.id,
      baby_id: babyId ?? null,
      title: title ?? null,
    })
    .select(CONVERSATION_COLUMNS)
    .single();

  if (error) {
    console.error('[createConversation] Database error creating conversation');
    throw new Error(`Database error creating conversation: ${error.message}`);
  }

  return toConversationSummary(conversation);
}

export async function addMessage(
  conversationId: string,
  role: ConversationMessageRole,
  content: string
): Promise<ConversationMessage> {
  const supabase = await createServerClient();

  await requireUser(supabase);

  const { data: message, error } = await supabase
    .from('ai_messages')
    .insert({
      conversation_id: conversationId,
      role,
      content,
    })
    .select(MESSAGE_COLUMNS)
    .single();

  if (error) {
    console.error('[addMessage] Database error creating message');
    throw new Error(`Database error creating message: ${error.message}`);
  }

  return toConversationMessage(message);
}

export async function getConversations(): Promise<ConversationSummary[]> {
  const supabase = await createServerClient();

  await requireUser(supabase);

  const { data: conversations, error } = await supabase
    .from('ai_conversations')
    .select(CONVERSATION_COLUMNS)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[getConversations] Database error fetching conversations');
    throw new Error(
      `Database error fetching conversations: ${error.message}`
    );
  }

  return conversations.map(toConversationSummary);
}

export async function getConversation(
  conversationId: string
): Promise<ConversationHistory | null> {
  const supabase = await createServerClient();

  await requireUser(supabase);

  const { data: conversation, error: conversationError } = await supabase
    .from('ai_conversations')
    .select(CONVERSATION_COLUMNS)
    .eq('id', conversationId)
    .maybeSingle();

  if (conversationError) {
    console.error('[getConversation] Database error fetching conversation');
    throw new Error(
      `Database error fetching conversation: ${conversationError.message}`
    );
  }

  if (!conversation) {
    return null;
  }

  const { data: messages, error: messagesError } = await supabase
    .from('ai_messages')
    .select(MESSAGE_COLUMNS)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (messagesError) {
    console.error('[getConversation] Database error fetching messages');
    throw new Error(
      `Database error fetching messages: ${messagesError.message}`
    );
  }

  return {
    ...toConversationSummary(conversation),
    messages: messages.map(toConversationMessage),
  };
}
