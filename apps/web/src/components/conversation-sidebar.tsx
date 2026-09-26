'use client';

import { useRouter } from 'next/navigation';
import { MessageSquare, Plus, X } from 'lucide-react';

import type { ConversationSummary } from '@/lib/api/types';

export function ConversationSidebar({
  conversations,
  selectedConversationId,
  open,
  onClose,
}: {
  conversations: ConversationSummary[];
  selectedConversationId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();

  const openConversation = (conversationId: string) => {
    onClose();
    router.push(`/ask?conversationId=${encodeURIComponent(conversationId)}`);
  };

  const startNewConversation = () => {
    onClose();
    router.push('/ask');
  };

  return (
    <div
      className={`absolute inset-0 z-40 transition-opacity duration-200 ${
        open
          ? 'pointer-events-auto opacity-100'
          : 'pointer-events-none opacity-0'
      }`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close conversation history"
        onClick={onClose}
        className="absolute inset-0 bg-black/20"
      />

      <aside
        className={`absolute left-0 top-0 flex h-full w-[82%] max-w-[300px] flex-col border-r border-[var(--border-subtle)] bg-[var(--page-surface)] shadow-xl transition-transform duration-200 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Conversation history"
      >
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-4">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              History
            </h2>

            <p className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
              Your conversations
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close conversation history"
            className="flex size-9 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--card-primary)] text-[var(--text-primary)]"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="border-b border-[var(--border-subtle)] p-3">
          <button
            type="button"
            onClick={startNewConversation}
            className="flex w-full items-center gap-2 rounded-xl bg-[var(--surface-terra)] px-3 py-2.5 text-left text-xs font-medium text-[var(--text-primary)]"
          >
            <Plus className="size-4" />
            <span>New conversation</span>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {conversations.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <MessageSquare className="mx-auto size-5 text-[var(--text-secondary)]" />

              <p className="mt-2 text-xs text-[var(--text-secondary)]">
                No past conversations yet.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conversation) => {
                const active = conversation.id === selectedConversationId;

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => openConversation(conversation.id)}
                    className={`w-full rounded-xl px-3 py-3 text-left transition ${
                      active
                        ? 'bg-[var(--surface-terra)]/70 text-[var(--text-primary)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--card-secondary)]'
                    }`}
                  >
                    <span className="block truncate text-xs font-medium">
                      {conversation.title?.trim() || 'Conversation'}
                    </span>

                    <span className="mt-1 block text-[10px] text-[var(--text-secondary)]">
                      {new Date(conversation.createdAt).toLocaleDateString()}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
