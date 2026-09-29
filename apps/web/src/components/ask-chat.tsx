'use client';

import { FormEvent, useState } from 'react';
import { Send, ThumbsDown, ThumbsUp } from 'lucide-react';

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

export function AskChat({ babyId }: { babyId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: result.answer,
          sources: result.sources,
          messageId: result.messageId,
          feedback: null,
        },
      ]);
    } catch (err) {
      if (!navigator.onLine) {
        setError("You're offline. Please reconnect and try again.");
      } else if (err instanceof DOMException && err.name === 'AbortError') {
        setError("Request timed out after 45 seconds. Please try again.");
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
    <section className="flex min-h-[calc(100dvh-9rem)] flex-col">
      <div className="pb-4">
        <h1 className="text-[1.5rem] font-semibold text-[var(--text-primary)]">
          Bloom companion
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Ask questions about your baby&apos;s development.
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="rounded-3xl bg-[var(--card-secondary)] p-4 text-sm text-[var(--text-secondary)]">
            Hi! I&apos;m Bloom. What would you like to know?
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={
                message.role === 'user'
                  ? 'ml-8 rounded-[18px] bg-[var(--surface-terra)] px-4 py-3 text-sm text-[var(--text-primary)]'
                  : 'mr-8 rounded-[18px] bg-[var(--card-secondary)] px-4 py-3 text-sm text-[var(--text-primary)]'
              }
            >
              <div className="whitespace-pre-wrap">
                {message.content}
              </div>

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

      <StandingDisclaimer text={ASK_DISCLAIMER} />

      <form
        onSubmit={handleSubmit}
        className="mt-4 flex items-center gap-2"
      >
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          disabled={loading}
          maxLength={2000}
          placeholder="Ask Bloom something…"
          aria-label="Ask Bloom a question"
          className="min-w-0 flex-1 rounded-full border border-[var(--border-subtle)] bg-[var(--card-primary)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] focus:border-[var(--border-card)]"
        />

        <button
          type="submit"
          disabled={loading || !question.trim()}
          aria-label="Send question"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--surface-terra)] text-[var(--text-primary)] disabled:opacity-40"
        >
          <Send className="size-4" />
        </button>
      </form>
    </section>
  );
}
