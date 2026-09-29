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
  conversations,
  conversationHistories,
  selectedConversation,
}: {
  babyId: string;
  conversations: ConversationSummary[];
  conversationHistories: ConversationHistory[];
  selectedConversation: ConversationHistory | null;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(selectedConversation?.id ?? null);
  const [recentConversations, setRecentConversations] =
    useState<ConversationSummary[]>([]);
  const [localHistories, setLocalHistories] =
    useState<ConversationHistory[]>([]);

  const histories = useMemo(() => {
    const merged = new Map<string, ConversationHistory>();

    for (const conversation of conversationHistories) {
      merged.set(conversation.id, conversation);
    }

    for (const conversation of localHistories) {
      merged.set(conversation.id, conversation);
    }

    return Array.from(merged.values());
  }, [conversationHistories, localHistories]);

  const displayedConversations = useMemo(() => {
    const merged = new Map<string, ConversationSummary>();

    for (const conversation of conversations) {
      merged.set(conversation.id, conversation);
    }

    for (const conversation of recentConversations) {
      merged.set(conversation.id, conversation);
    }

    return [
      ...recentConversations,
      ...Array.from(merged.values()).filter(
        (conversation) =>
          !recentConversations.some(
            (recent) => recent.id === conversation.id,
          ),
      ),
    ];
  }, [conversations, recentConversations]);

  const currentConversation = useMemo(
    () =>
      histories.find(
        (conversation) => conversation.id === selectedConversationId,
      ) ?? null,
    [histories, selectedConversationId],
  );

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
    const conversation = histories.find(
      (item) => item.id === conversationId,
    );

    if (!conversation) {
      return;
    }

    setSelectedConversationId(conversationId);
    setSidebarOpen(false);
  };

  const startNewConversation = () => {
    setSelectedConversationId(null);
    setSidebarOpen(false);
  };

  const handleConversationCreated = (conversation: ConversationHistory) => {
    const summary = {
    id: conversation.id,
    babyId: conversation.babyId,
    title: conversation.title,
    createdAt: conversation.createdAt,
  };

  setRecentConversations((current) => [
    summary,
    ...current.filter((item) => item.id !== summary.id),
  ]);

    setLocalHistories((current) => [
      conversation,
      ...current.filter((item) => item.id !== conversation.id),
    ]);

    setSelectedConversationId(conversation.id);
  };

  return (
    <section className="relative flex min-h-[calc(100dvh-9rem)] flex-col">
      <div className="mb-3 flex items-center">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open conversation history"
          aria-expanded={sidebarOpen}
          className="flex size-10 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--card-primary)] text-[var(--text-primary)] shadow-sm"
        >
          <Menu className="size-5" />
        </button>
      </div>

      <div className="min-h-0 flex-1">
        <AskChat
          key={selectedConversationId ?? 'new-conversation'}
          babyId={babyId}
          initialConversation={currentConversation}
          onConversationCreated={handleConversationCreated}
        />
      </div>

      <ConversationSidebar
        conversations={displayedConversations}
        selectedConversationId={selectedConversationId}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onConversationSelect={openConversation}
        onNewConversation={startNewConversation}
      />
    </section>
  );
}
