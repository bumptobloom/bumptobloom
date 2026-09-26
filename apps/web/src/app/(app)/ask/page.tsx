import { redirect } from 'next/navigation';

import { AskConversationShell } from '@/components/ask-conversation-shell';
import { getHome } from '@/lib/api/home';
import { getConversation, getConversations } from '@/lib/api/conversations';

export const dynamic = 'force-dynamic';

export default async function AskPage(props: {
  searchParams?: Promise<{
    conversationId?: string;
  }>;
}) {
  const home = await getHome();

  if (!home.baby) {
    redirect('/onboarding');
  }

  const searchParams = await props.searchParams;
  const requestedConversationId = searchParams?.conversationId ?? null;

  const conversations = await getConversations();

  const selectedConversationId =
    requestedConversationId &&
    conversations.some((conversation) => conversation.id === requestedConversationId)
      ? requestedConversationId
      : null;

  const selectedConversation = selectedConversationId
    ? await getConversation(selectedConversationId)
    : null;

  return (
    <AskConversationShell
      babyId={home.baby.id}
      conversations={conversations}
      selectedConversation={selectedConversation}
    />
  );
}
