'use client';

import { useEffect, useMemo, useState } from 'react';


import type {
  ConversationHistory,
  ConversationSummary,
} from '@/lib/api/types';

import { AskChat } from '@/components/ask-chat';
import { ConversationSidebar } from '@/components/conversation-sidebar';

export function AskConversationShell({
  babyId,
  conversations: initialConversations,
  selectedConversationId: initialSelectedConversationId,
}: {
  babyId: string;
  conversations: ConversationSummary[];
  selectedConversationId?: string | null;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<ConversationSummary[]>(
    initialConversations,
  );
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(initialSelectedConversationId ?? null);
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationHistory | null>(null);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [conversationError, setConversationError] = useState<string | null>(
    null,
  );

  const sortedConversations = useMemo(
    () =>
      [...conversations].sort((a, b) => {
        if (a.isPinned !== b.isPinned) {
          return a.isPinned ? -1 : 1;
        }

        return (
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
        );
      }),
    [conversations],
  );

  useEffect(() => {
    if (!selectedConversationId) {
      return;
    }

    if (selectedConversation?.id === selectedConversationId) {
      return;
    }

    let cancelled = false;

    const loadConversation = async () => {
      setLoadingConversation(true);
      setConversationError(null);

      try {
        const response = await fetch(
          `/api/ask/conversations/${encodeURIComponent(selectedConversationId)}`,
          {
            method: 'GET',
            cache: 'no-store',
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? 'Could not load that conversation.');
        }

        if (!cancelled) {
          setSelectedConversation(data.conversation as ConversationHistory);
        }
      } catch (error) {
        if (!cancelled) {
          setSelectedConversation(null);
          setConversationError(
            error instanceof Error
              ? error.message
              : 'Could not load that conversation.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingConversation(false);
        }
      }
    };

    void loadConversation();

    return () => {
      cancelled = true;
    };
  }, [selectedConversationId, selectedConversation]);

  useEffect(() => {
    if (selectedConversationId) {
      window.history.replaceState(
        null,
        '',
        `/ask?conversationId=${encodeURIComponent(selectedConversationId)}`,
      );
    } else {
      window.history.replaceState(null, '', '/ask');
    }
  }, [selectedConversationId]);

  const openConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setSidebarOpen(false);
  };

  const startNewConversation = () => {
    setSelectedConversationId(null);
    setSelectedConversation(null);
    setConversationError(null);
    setSidebarOpen(false);
  };

  const handleConversationCreated = (
    conversation: ConversationHistory,
  ) => {
    const summary: ConversationSummary = {
      id: conversation.id,
      babyId: conversation.babyId,
      title: conversation.title,
      isPinned: conversation.isPinned,
      createdAt: conversation.createdAt,
    };

    setConversations((current) => [
      summary,
      ...current.filter((item) => item.id !== summary.id),
    ]);

    setSelectedConversationId(summary.id);
    setSelectedConversation(conversation);
  };

  const handleConversationUpdated = (
    conversation: ConversationSummary,
  ) => {
    setConversations((current) => {
      const exists = current.some((item) => item.id === conversation.id);

      if (!exists) {
        return [conversation, ...current];
      }

      return current.map((item) =>
        item.id === conversation.id ? conversation : item,
      );
    });

    setSelectedConversation((current) =>
      current?.id === conversation.id
        ? { ...current, ...conversation }
        : current,
    );
  };


  const handleConversationDeleted = (conversationId: string) => {
    setConversations((current) =>
      current.filter((item) => item.id !== conversationId),
    );

    if (selectedConversationId === conversationId) {
      setSelectedConversationId(null);
      setSelectedConversation(null);
      setConversationError(null);
    }
  };

  const chatKey = selectedConversationId ?? 'new-conversation';

  return (
    // Fills the main column rather than asking for a viewport height of its
    // own. Both this and AskChat used to set min-h-[calc(100dvh-9rem)], one
    // nested inside the other under the menu row, and 9rem was short of the
    // real chrome anyway (66px header + 20px top + 5.5rem bottom = 174px).
    // That put the composer about 90px below the fold, which is the "I don't
    // see the ask option unless I scroll down" from PM testing. Percentages
    // cannot fix it: main's specified height is auto, so h-full on a child
    // collapses to content height. It has to be flex all the way down.
    <section className="relative flex min-h-0 flex-1 flex-col">
      {conversationError ? (
        <p
          role="alert"
          className="mb-3 rounded-xl bg-[var(--card-secondary)] px-3 py-2 text-sm text-[var(--text-secondary)]"
        >
          {conversationError}
        </p>
      ) : null}

      {loadingConversation ? (
        <div className="flex flex-1 items-center justify-center text-sm text-[var(--text-secondary)]">
          Loading conversation…
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <AskChat
            key={chatKey}
            babyId={babyId}
            initialConversation={selectedConversation}
            onConversationCreated={handleConversationCreated}
          />
        </div>
      )}

      <ConversationSidebar
        conversations={sortedConversations}
        selectedConversationId={selectedConversationId}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onConversationSelect={openConversation}
        onNewConversation={startNewConversation}
        onConversationUpdated={handleConversationUpdated}
        onConversationDeleted={handleConversationDeleted}
      />
    </section>
  );
}
