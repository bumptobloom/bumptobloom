'use client';

import { useState } from 'react';
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
  selectedConversation,
}: {
  babyId: string;
  conversations: ConversationSummary[];
  selectedConversation: ConversationHistory | null;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          key={selectedConversation?.id ?? 'new-conversation'}
          babyId={babyId}
          initialConversation={selectedConversation}
        />
      </div>

      <ConversationSidebar
        conversations={conversations}
        selectedConversationId={selectedConversation?.id ?? null}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </section>
  );
}
