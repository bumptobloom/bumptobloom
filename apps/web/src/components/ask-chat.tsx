'use client';

import { FormEvent, useEffect, useState } from 'react';

import { Mic, Send, ThumbsDown, ThumbsUp } from 'lucide-react';

import type {
  ConversationHistory,
  ConversationMessage,
} from '@/lib/api/types';

import { BloomAvatar } from '@/components/bloom-avatar';
import { StandingDisclaimer } from '@/components/standing-disclaimer';

type AskSource = {
  title: string;
  url: string;
};

type Message = {
  role: 'user' | 'assistant';
  content: string;
  sources?: AskSource[];
  messageId?: string | null;
  feedback?: 1 | -1 | null;
};

type AskResponse = {
  answer: string;
  sources: AskSource[];
  conversationId: string;
  messageId: string | null;
  redirectedToHealth: boolean;
};

const ASK_DISCLAIMER =
  'AI can make mistakes. For medical concerns, contact a qualified healthcare professional. If you are experiencing a medical emergency, call 911.';

function toMessage(message: ConversationMessage): Message {
  return {
    role: message.role === 'assistant' ? 'assistant' : 'user',
    content: message.content,
    sources: message.sources,
    messageId: message.role === 'assistant' ? message.id : null,
    feedback: message.feedback,
  };
}

export function AskChat({
  babyId,
  initialConversation,
  onConversationCreated,
}: {
  babyId: string;
  initialConversation?: ConversationHistory | null;
  onConversationCreated?: (conversation: ConversationHistory) => void;
}) {
  const [messages, setMessages] = useState<Message[]>(() =>
    initialConversation ? initialConversation.messages.map(toMessage) : [],
  );
  const [question, setQuestion] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(
    initialConversation?.id ?? null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The greeting's timestamp. It is the time this screen was opened, which is
  // the only honest time for a message that was never sent.
  const [greetingTime, setGreetingTime] = useState<string | null>(null);

  useEffect(() => {
    function stamp() {
      setGreetingTime(
        new Intl.DateTimeFormat('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        }).format(new Date()),
      );
    }

    stamp();
  }, []);


  const handleFeedback = async (
    messageId: string,
    feedback: 1 | -1,
  ) => {
    setMessages((current) =>
      current.map((message) =>
        message.messageId === messageId
          ? { ...message, feedback }
          : message,
      ),
    );

    try {
      const response = await fetch('/api/ask/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageId, feedback }),
      });

      if (!response.ok) {
        throw new Error('Could not save feedback.');
      }
    } catch (err) {
      console.error('[ask] Failed to save feedback:', err);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loading) {
      return;
    }

    setError(null);
    setLoading(true);

    setMessages((current) => [
      ...current,
      { role: 'user', content: trimmedQuestion },
    ]);

    setQuestion('');

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 45_000);

    try {
      if (!navigator.onLine) {
        throw new Error("You're offline. Please reconnect and try again.");
      }

      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          babyId,
          conversationId,
          question: trimmedQuestion,
        }),
        signal: controller.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? 'Something went wrong.');
      }

      const result = data as AskResponse;

      setConversationId(result.conversationId);

      const assistantMessage: Message = {
        role: 'assistant',
        content: result.answer,
        sources: result.sources,
        messageId: result.messageId,
        feedback: null,
      };

      setMessages((current) => [...current, assistantMessage]);

      if (!conversationId && result.messageId) {
        const now = new Date().toISOString();

        onConversationCreated?.({
          id: result.conversationId,
          babyId,
          title: trimmedQuestion.slice(0, 80),
          isPinned: false,
          createdAt: now,
          messages: [
            {
              id: `pending-user-${result.conversationId}`,
              conversationId: result.conversationId,
              role: 'user',
              content: trimmedQuestion,
              sources: [],
              feedback: null,
              createdAt: now,
            },
            {
              id: result.messageId,
              conversationId: result.conversationId,
              role: 'assistant',
              content: result.answer,
              sources: result.sources,
              feedback: null,
              createdAt: now,
            },
          ],
        });
      }
    } catch (err) {
      if (!navigator.onLine) {
        setError("You're offline. Please reconnect and try again.");
      } else if (err instanceof DOMException && err.name === 'AbortError') {
        setError('Request timed out after 45 seconds. Please try again.');
      } else {
        setError(
          err instanceof Error
            ? err.message
            : 'Something went wrong. Please try again.',
        );
      }
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-start gap-[var(--space-12)]">
            <BloomAvatar className="size-10 shrink-0" />

            <div className="min-w-0 flex-1">
              <div className="rounded-[var(--radius-20)] bg-[var(--card-primary)] p-[var(--space-16)]">
                <p
                  className="text-[var(--text-primary)]"
                  style={{ font: 'var(--type-card-title)' }}
                >
                  Hi there! I&apos;m Bloom
                </p>

                <hr className="my-[var(--space-12)] border-t border-[var(--border-subtle)]" />

                <p
                  className="text-[var(--text-primary)]"
                  style={{ font: 'var(--type-body)' }}
                >
                  Ask me anything about feeding, sleeping, diaper and digestion,
                  crying and soothing, mom&apos;s wellbeing.
                </p>
              </div>

              {/* 05a shows a time under this bubble. Rendered after mount, not
                  during SSR: the server is in UTC and the phone is not, so
                  formatting it on both sides is a hydration mismatch. Empty
                  until then, so the bubble does not jump. */}
              <p className="mt-[var(--space-8)] text-[12px] text-[var(--text-secondary)]">
                {greetingTime ?? '\u00a0'}
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={`${message.messageId ?? message.role}-${index}`}
              className={
                message.role === 'user'
                  ? 'ml-8 rounded-[18px] bg-[var(--surface-terra)] px-4 py-3 text-sm text-[var(--text-primary)]'
                  : 'mr-8 rounded-[18px] bg-[var(--card-secondary)] px-4 py-3 text-sm text-[var(--text-primary)]'
              }
            >
              <div className="whitespace-pre-wrap">{message.content}</div>

              {message.role === 'assistant' && message.sources?.length ? (
                <div className="mt-3 border-t border-[var(--border-subtle)] pt-3">
                  <p className="text-xs font-medium text-[var(--text-secondary)]">
                    Sources:{' '}
                    {message.sources.map((source, sourceIndex) => (
                      <span key={source.url}>
                        {sourceIndex > 0 ? ' · ' : ''}
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline underline-offset-2 hover:text-blue-700"
                        >
                          {source.title}
                        </a>
                      </span>
                    ))}
                  </p>
                </div>
              ) : null}

              {message.role === 'assistant' && message.messageId ? (
                <div className="mt-3 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleFeedback(message.messageId!, 1)}
                    aria-label="Helpful answer"
                    aria-pressed={message.feedback === 1}
                    className={`rounded-full p-2 transition ${
                      message.feedback === 1
                        ? 'bg-[var(--surface-terra)]'
                        : 'hover:bg-[var(--card-primary)]'
                    }`}
                  >
                    <ThumbsUp className="size-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFeedback(message.messageId!, -1)}
                    aria-label="Unhelpful answer"
                    aria-pressed={message.feedback === -1}
                    className={`rounded-full p-2 transition ${
                      message.feedback === -1
                        ? 'bg-[var(--surface-terra)]'
                        : 'hover:bg-[var(--card-primary)]'
                    }`}
                  >
                    <ThumbsDown className="size-4" />
                  </button>
                </div>
              ) : null}
            </div>
          ))
        )}

        {loading ? (
          <div className="mr-8 rounded-[18px] bg-[var(--card-secondary)] px-4 py-3 text-sm text-[var(--text-secondary)]">
            Bloom is thinking…
          </div>
        ) : null}

        {error ? (
          <p role="alert" className="text-sm text-[var(--text-secondary)]">
            {error}
          </p>
        ) : null}
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-4 flex items-center gap-2"
      >
        <div className="relative min-w-0 flex-1">
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            disabled={loading}
            maxLength={2000}
            placeholder="Ask Bloom…"
            aria-label="Ask Bloom a question"
            className="w-full rounded-full border border-[var(--border-subtle)] bg-[var(--card-primary)] py-3 pl-5 pr-12 text-[0.95rem] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] focus:border-[var(--border-card)]"
          />

          {/* Drawn because 05a shows it. It does nothing yet: dictation is not
              built, and the PMs logged "no voice-to-text" separately. Not a
              button, so nothing invites a tap that would do nothing. */}
          <Mic
            aria-hidden
            className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-[var(--text-secondary)]"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !question.trim()}
          aria-label="Send question"
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--brand-secondary)] text-[#fffcf4] disabled:opacity-40"
        >
          <Send className="size-5" />
        </button>
      </form>

      {/* Below the composer, per 05a. The composer is the thing a parent
          reaches for, so it sits directly under the conversation; the
          standing disclaimer reads as a footnote beneath it. */}
      <div className="mt-3">
        <StandingDisclaimer text={ASK_DISCLAIMER} />
      </div>
    </section>
  );
}
