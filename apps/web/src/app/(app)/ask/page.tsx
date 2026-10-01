import { redirect } from 'next/navigation';

import { AskConversationShell } from '@/components/ask-conversation-shell';

import { getHome } from '@/lib/api/home';
import { getConversations } from '@/lib/api/conversations';

export const dynamic = 'force-dynamic';

export default async function AskPage(props: {
  searchParams?: Promise<{
    conversationId?: string;
  }>;
}) {
  const [home, searchParams] = await Promise.all([
    getHome(),
    props.searchParams,
  ]);

  if (!home.baby) {
    redirect('/onboarding');
  }

  const conversations = await getConversations();
  const requestedConversationId = searchParams?.conversationId ?? null;

  const selectedConversationId =
    requestedConversationId &&
    conversations.some(
      (conversation) => conversation.id === requestedConversationId,
    )
      ? requestedConversationId
      : null;

  return (
    <AskConversationShell
      babyId={home.baby.id}
      conversations={conversations}
      selectedConversationId={selectedConversationId}
    />
  );
}
