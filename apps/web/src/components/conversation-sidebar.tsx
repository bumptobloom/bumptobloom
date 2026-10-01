'use client';

import { useEffect, useRef, useState } from 'react';

import {
  Check,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Pin,
  PinOff,
  Plus,
  Trash2,
  X,
} from 'lucide-react';

import type { ConversationSummary } from '@/lib/api/types';

type ConversationAction = 'rename' | 'pin' | 'delete';

export function ConversationSidebar({
  conversations,
  selectedConversationId,
  open,
  onClose,
  onConversationSelect,
  onNewConversation,
  onConversationUpdated,
  onConversationDeleted,
}: {
  conversations: ConversationSummary[];
  selectedConversationId: string | null;
  open: boolean;
  onClose: () => void;
  onConversationSelect: (conversationId: string) => void;
  onNewConversation: () => void;
  onConversationUpdated: (conversation: ConversationSummary) => void;
  onConversationDeleted: (conversationId: string) => void;
}) {
  const [menuConversationId, setMenuConversationId] = useState<string | null>(
    null,
  );
  const [renamingConversationId, setRenamingConversationId] = useState<
    string | null
  >(null);
  const [renameValue, setRenameValue] = useState('');
  const [busyAction, setBusyAction] = useState<{
    conversationId: string;
    action: ConversationAction;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuConversationId) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuConversationId(null);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [menuConversationId]);

  const startRename = (conversation: ConversationSummary) => {
    setError(null);
    setMenuConversationId(null);
    setRenamingConversationId(conversation.id);
    setRenameValue(conversation.title?.trim() || 'Conversation');
  };

  const cancelRename = () => {
    setRenamingConversationId(null);
    setRenameValue('');
  };

  const saveRename = async (conversation: ConversationSummary) => {
    const title = renameValue.trim();
    if (!title || busyAction) {
      return;
    }

    setBusyAction({
      conversationId: conversation.id,
      action: 'rename',
    });
    setError(null);

    onConversationUpdated({
      ...conversation,
      title,
    });
    cancelRename();

    try {
      const response = await fetch(
        `/api/ask/conversations/${encodeURIComponent(conversation.id)}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'rename',
            title,
          }),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? 'Could not rename that conversation.');
      }

      onConversationUpdated(data.conversation as ConversationSummary);
    } catch (err) {
      onConversationUpdated(conversation);
      setError(
        err instanceof Error
          ? err.message
          : 'Could not rename that conversation.',
      );
    } finally {
      setBusyAction(null);
    }
  };

  const togglePin = async (conversation: ConversationSummary) => {
    if (busyAction) {
      return;
    }

    const nextPinned = !conversation.isPinned;

    setBusyAction({
      conversationId: conversation.id,
      action: 'pin',
    });
    setMenuConversationId(null);
    setError(null);

    onConversationUpdated({
      ...conversation,
      isPinned: nextPinned,
    });

    try {
      const response = await fetch(
        `/api/ask/conversations/${encodeURIComponent(conversation.id)}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'pin',
            isPinned: nextPinned,
          }),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? 'Could not update that conversation.',
        );
      }

      onConversationUpdated(data.conversation as ConversationSummary);
    } catch (err) {
      onConversationUpdated(conversation);
      setError(
        err instanceof Error
          ? err.message
          : 'Could not update that conversation.',
      );
    } finally {
      setBusyAction(null);
    }
  };

  const deleteConversation = async (conversation: ConversationSummary) => {
    if (busyAction) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${conversation.title?.trim() || 'Conversation'}"? This cannot be undone.`,
    );
    if (!confirmed) {
      return;
    }

    setBusyAction({
      conversationId: conversation.id,
      action: 'delete',
    });
    setMenuConversationId(null);
    setError(null);

    onConversationDeleted(conversation.id);

    try {
      const response = await fetch(
        `/api/ask/conversations/${encodeURIComponent(conversation.id)}`,
        {
          method: 'DELETE',
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? 'Could not delete that conversation.',
        );
      }
    } catch (err) {
      onConversationUpdated(conversation);
      setError(
        err instanceof Error
          ? err.message
          : 'Could not delete that conversation.',
      );
    } finally {
      setBusyAction(null);
    }
  };

  const pinnedConversations = conversations.filter(
    (conversation) => conversation.isPinned,
  );
  const recentConversations = conversations.filter(
    (conversation) => !conversation.isPinned,
  );

  const renderConversation = (conversation: ConversationSummary) => {
    const active = conversation.id === selectedConversationId;
    const menuOpen = conversation.id === menuConversationId;
    const renaming = conversation.id === renamingConversationId;
    const busy = busyAction?.conversationId === conversation.id;

    return (
      <div
        key={conversation.id}
        className={`relative rounded-2xl ${
          active ? 'bg-[var(--card-secondary)]' : ''
        }`}
      >
        {renaming ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void saveRename(conversation);
            }}
            className="p-2"
          >
            <input
              autoFocus
              value={renameValue}
              onChange={(event) => setRenameValue(event.target.value)}
              maxLength={100}
              disabled={busy}
              aria-label="Conversation name"
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--card-primary)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-card)]"
            />

            <div className="mt-2 flex justify-end gap-1">
              <button
                type="button"
                onClick={cancelRename}
                disabled={busy}
                className="rounded-lg px-2 py-1 text-xs text-[var(--text-secondary)] hover:bg-[var(--card-primary)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy || !renameValue.trim()}
                className="inline-flex items-center gap-1 rounded-lg bg-[var(--surface-terra)] px-2 py-1 text-xs text-[var(--text-primary)] disabled:opacity-40"
              >
                {busy ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Check className="size-3" />
                )}
                Save
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => onConversationSelect(conversation.id)}
              className="min-w-0 flex-1 rounded-2xl px-3 py-3 text-left hover:bg-[var(--card-secondary)]"
              aria-current={active ? 'page' : undefined}
            >
              <span className="block truncate pr-1 text-sm font-medium text-[var(--text-primary)]">
                {conversation.title?.trim() || 'Conversation'}
              </span>
              <span className="mt-1 block text-xs text-[var(--text-secondary)]">
                {new Date(conversation.createdAt).toLocaleDateString()}
              </span>
            </button>

            <div
              ref={menuOpen ? menuRef : undefined}
              className="relative shrink-0 pr-2"
            >
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setMenuConversationId((current) =>
                    current === conversation.id ? null : conversation.id,
                  );
                }}
                aria-label={`Actions for ${conversation.title?.trim() || 'Conversation'}`}
                aria-expanded={menuOpen}
                disabled={busy}
                className="rounded-full p-2 text-[var(--text-secondary)] hover:bg-[var(--card-primary)] hover:text-[var(--text-primary)] disabled:opacity-40"
              >
                {busy ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <MoreHorizontal className="size-4" />
                )}
              </button>

              {menuOpen ? (
                <div className="absolute right-2 top-10 z-50 w-44 rounded-xl border border-[var(--border-subtle)] bg-[var(--card-primary)] p-1 shadow-lg">
                  <button
                    type="button"
                    onClick={() => startRename(conversation)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--card-secondary)]"
                  >
                    <Pencil className="size-4" />
                    Rename
                  </button>

                  <button
                    type="button"
                    onClick={() => void togglePin(conversation)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--card-secondary)]"
                  >
                    {conversation.isPinned ? (
                      <PinOff className="size-4" />
                    ) : (
                      <Pin className="size-4" />
                    )}
                    {conversation.isPinned ? 'Unpin chat' : 'Pin chat'}
                  </button>

                  <button
                    type="button"
                    onClick={() => void deleteConversation(conversation)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--card-secondary)]"
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    );
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
        className={`absolute left-0 top-0 flex h-full w-[82%] max-w-[320px] flex-col border-r border-[var(--border-subtle)] bg-[var(--card-primary)] shadow-xl transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Conversation history"
      >
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] p-4">
          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              History
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Your conversations
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close conversation history"
            className="rounded-full p-2 text-[var(--text-secondary)] hover:bg-[var(--card-secondary)]"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="border-b border-[var(--border-subtle)] p-3">
          <button
            type="button"
            onClick={onNewConversation}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--surface-terra)] px-3 py-2.5 text-sm font-medium text-[var(--text-primary)]"
          >
            <Plus className="size-4" />
            New conversation
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {error ? (
            <p
              role="alert"
              className="mb-2 rounded-xl bg-[var(--card-secondary)] px-3 py-2 text-xs text-[var(--text-secondary)]"
            >
              {error}
            </p>
          ) : null}

          {conversations.length === 0 ? (
            <div className="flex flex-col items-center px-4 py-10 text-center">
              <MessageSquare className="mb-3 size-6 text-[var(--text-secondary)]" />
              <p className="text-sm text-[var(--text-primary)]">
                No past conversations yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pinnedConversations.length > 0 ? (
                <section>
                  <div className="mb-1 flex items-center gap-1 px-2 text-xs font-medium text-[var(--text-secondary)]">
                    <Pin className="size-3" />
                    Pinned
                  </div>
                  <div className="space-y-1">
                    {pinnedConversations.map(renderConversation)}
                  </div>
                </section>
              ) : null}

              {recentConversations.length > 0 ? (
                <section>
                  {pinnedConversations.length > 0 ? (
                    <div className="mb-1 px-2 text-xs font-medium text-[var(--text-secondary)]">
                      Recent
                    </div>
                  ) : null}

                  <div className="space-y-1">
                    {recentConversations.map(renderConversation)}
                  </div>
                </section>
              ) : null}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
