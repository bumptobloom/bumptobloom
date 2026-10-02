'use client';

import { useEffect, useMemo, useState } from 'react';

import { Menu } from 'lucide-react';

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
    <section className="relative flex min-h-[calc(100dvh-9rem)] flex-col">
      <div className="mb-3 flex items-center">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open conversation history"
          className="rounded-full p-2 text-[var(--text-secondary)] hover:bg-[var(--card-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-brand)]"
        >
          <Menu className="size-5" aria-hidden />
        </button>
      </div>

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
        <div className="min-h-0 flex-1">
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
