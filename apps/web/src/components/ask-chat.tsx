'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';

import { Mic, Send, TriangleAlert } from 'lucide-react';

import type {
  ConversationHistory,
  ConversationMessage,
} from '@/lib/api/types';

import { StandingDisclaimer } from '@/components/standing-disclaimer';
import { useDictation } from '@/components/use-dictation';
import { appendTranscript } from '@/lib/ask/append-transcript';
import { AskAnswer } from '@/components/ask-answer';
import { dedupeSources } from '@/lib/ask/dedupe-sources';
import { REDIRECT_ANSWER } from '@btb/shared';

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
  redirectedToHealth?: boolean;
  createdAt?: string;
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

  function formatMessageTime(createdAt?: string): string {
  if (!createdAt) return '';

  return new Date(createdAt).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function toMessage(message: ConversationMessage): Message {
  return {
    role: message.role === 'assistant' ? 'assistant' : 'user',
    content: message.content,
    sources: message.sources,
    messageId: message.role === 'assistant' ? message.id : null,
    feedback: message.feedback,
    redirectedToHealth: message.content === REDIRECT_ANSWER,
    createdAt: message.createdAt,
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
  const submittingRef = useRef(false);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const dictation = useDictation((text) =>
    setQuestion((current) => appendTranscript(current, text, 2000)),
  );
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

  useEffect(() => {
    const container = chatScrollRef.current;

    if (!container) {
      return;
    }

    requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
    });
  }, [messages, loading]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (dictation.listening) {
      dictation.stop();
    }

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loading || submittingRef.current) {
      return;
    }

    submittingRef.current = true;
    setError(null);
    setLoading(true);

    const createdAt = new Date().toISOString();

  setMessages((current) => [
    ...current,
    {
      role: 'user',
      content: trimmedQuestion,
      createdAt,
    },
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
        redirectedToHealth: result.redirectedToHealth,
        createdAt: new Date().toISOString(),
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
      submittingRef.current = false;
      setLoading(false);
    }
  };

  const askWaveStyle = `
    @keyframes askWave {
      from { transform: scaleY(0.45); opacity: 0.55; }
      to { transform: scaleY(1); opacity: 1; }
    }
  `;

  return (
    <>
      <style>{askWaveStyle}</style>
    <section className="flex h-[calc(100dvh-9rem)] min-h-0 flex-col">
      <div ref={chatScrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto ask-chat-scroll">
        {messages.length === 0 ? (
<div className="flex items-start gap-[var(--space-12)]">
            <img src="/Avatar.svg" alt="Bloom" className="size-10 shrink-0 object-contain" />

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
                  className="text-sm leading-6 text-[var(--text-primary)]"
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
              className="w-full"
            >
              {message.role === 'user' ? (
                <div className="flex flex-col items-end">
                  <div className="max-w-[82%] rounded-[18px] bg-[#355b35] px-4 py-3 text-sm text-white">
                    <div className="whitespace-pre-wrap">
                      {message.content}
                    </div>
                  </div>

                  <span className="mt-2 mr-1 text-xs text-[#667064]">
                    {formatMessageTime(message.createdAt)}
                  </span>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <img
                    src="/Avatar.svg"
                    alt="Bloom"
                    className="mt-1 size-10 shrink-0 object-contain"
                  />

                  <div className="min-w-0 max-w-[82%]">
                    <div className="rounded-[18px] border border-[#e6dfcf] bg-[#fffdf7] px-4 py-3 text-sm text-[var(--text-primary)]">
                      {message.redirectedToHealth ? (
                        <div className="w-full max-w-[380px] rounded-[16px] border border-[#B88768] bg-[#F7E6D8] px-5 py-5">
  <div className="flex items-center gap-3">
    <TriangleAlert
      className="size-5 shrink-0 text-[#A96F4F]"
      aria-hidden="true"
    />

    <p className="text-[17px] font-medium leading-6 text-[#A96F4F]">
      Contact your pediatrician
    </p>
  </div>

  <div className="mt-3 border-t border-[#E5D3C5]" />

  <p className="mt-4 text-[16px] leading-6 text-[#36453A]">
    {message.content}
  </p>
</div>
                      ) : (
                        <AskAnswer content={message.content} />
                      )}

                      {message.sources?.length ? (
                        <div className="mt-3 border-t border-[var(--border-subtle)] pt-3">
                          <p className="text-xs font-medium text-[var(--text-secondary)]">
                            Sources:{' '}
                            {dedupeSources(message.sources).map(
                              (source, sourceIndex) => (
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
                              ),
                            )}
                          </p>
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-xs text-[#667064]">
                        {formatMessageTime(message.createdAt)}
                      </span>

                      {message.messageId ? (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              handleFeedback(message.messageId!, 1)
                            }
                            aria-label="Helpful answer"
                            aria-pressed={message.feedback === 1}
                            className={`text-lg leading-none transition-transform duration-150 ${
                              message.feedback === 1
                                ? 'scale-125'
                                : 'scale-100'
                            }`}
                          >
                            👍
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleFeedback(message.messageId!, -1)
                            }
                            aria-label="Unhelpful answer"
                            aria-pressed={message.feedback === -1}
                            className={`text-lg leading-none transition-transform duration-150 ${
                              message.feedback === -1
                                ? 'scale-125'
                                : 'scale-100'
                            }`}
                          >
                            👎
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {loading ? (
          <div className="mr-8 flex items-start gap-[var(--space-12)]">
            <img
              src="/Avatar.svg"
              alt="Bloom"
              className="size-10 shrink-0 object-contain"
            />
            <div className="rounded-[18px] bg-[var(--card-secondary)] px-4 py-3 text-sm text-[var(--text-secondary)]">
              Bloom is thinking…
            </div>
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
        className="mt-4 flex shrink-0 items-center gap-2"
      >
        <div className="relative min-w-0 flex-1">
          {dictation.listening ? (
            <div
              className="flex h-12 w-full items-center gap-3 rounded-full border border-[var(--border-subtle)] bg-[var(--card-primary)] px-3"
              aria-live="polite"
              aria-label="Recording voice input"
            >
              <button
                type="button"
                onClick={dictation.stop}
                disabled={loading}
                aria-label="Stop recording"
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-[var(--surface-terra)]"
              >
                <span className="text-xl leading-none">×</span>
              </button>

              <div className="flex min-w-0 flex-1 items-center gap-[3px]">
                {Array.from({ length: 28 }).map((_, index) => (
                  <span
                    key={index}
                    className="w-[2px] rounded-full bg-[var(--text-accent-terracotta)]"
                    style={{
                      height: `${6 + ((index * 7) % 18)}px`,
                      animation: `askWave 0.8s ease-in-out ${index * 0.035}s infinite alternate`,
                    }}
                  />
                ))}
              </div>

              <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-[var(--text-accent-terracotta)]">
                <span className="size-2 animate-pulse rounded-full bg-[var(--text-accent-terracotta)]" />
                Recording
              </span>

              <button
                type="button"
                onClick={dictation.stop}
                disabled={loading}
                aria-label="Stop recording"
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--surface-terra)] text-[var(--text-primary)]"
              >
                <span className="size-3 rounded-[2px] bg-current" />
              </button>
            </div>
          ) : (
            <>
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                disabled={loading}
                maxLength={2000}
                placeholder="Ask Bloom something…"
                aria-label="Ask Bloom a question"
                className="w-full rounded-full border border-[var(--border-subtle)] bg-[var(--card-primary)] px-4 py-3 pr-12 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] focus:border-[var(--border-card)]"
              />

              {dictation.supported ? (
                <button
                  type="button"
                  onClick={dictation.toggle}
                  disabled={loading}
                  aria-label="Dictate your question"
                  className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:text-[var(--text-primary)] disabled:opacity-40"
                >
                  <Mic className="size-5" aria-hidden />
                </button>
              ) : null}
            </>
          )}
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
    </>
  );
}
