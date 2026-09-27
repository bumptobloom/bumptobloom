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
  const [home, searchParams] = await Promise.all([
    getHome(),
    props.searchParams,
  ]);

  if (!home.baby) {
    redirect('/onboarding');
  }

  const requestedConversationId = searchParams?.conversationId ?? null;

  const [conversations, selectedConversation] = await Promise.all([
    getConversations(),
    requestedConversationId
      ? getConversation(requestedConversationId)
      : Promise.resolve(null),
  ]);

  return (
    <AskConversationShell
      babyId={home.baby.id}
      conversations={conversations}
      selectedConversation={selectedConversation}
    />
  );
}
