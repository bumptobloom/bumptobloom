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
  const conversations = await getConversations();

  const conversationHistories = await Promise.all(
    conversations.map(async (conversation) => {
      const history = await getConversation(conversation.id);
      return history;
    }),
  );

  const histories = conversationHistories.filter(
    (conversation): conversation is NonNullable<typeof conversation> =>
      conversation !== null,
  );

  const selectedConversation =
    requestedConversationId
      ? histories.find(
          (conversation) => conversation.id === requestedConversationId,
        ) ?? null
      : null;

  return (
    <AskConversationShell
      babyId={home.baby.id}
      conversations={conversations}
      conversationHistories={histories}
      selectedConversation={selectedConversation}
    />
  );
}
