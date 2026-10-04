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
import { Callout } from '@/components/ui/callout';
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loading || submittingRef.current) {
      return;
    }

    submittingRef.current = true;
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

  return (
    <section className="flex min-h-[calc(100dvh-9rem)] flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto">
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
                    {new Date().toLocaleTimeString([], {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
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
                        <Callout variant="safety">
                          <div className="flex items-start gap-[var(--space-12)]">
                            <TriangleAlert
                              className="mt-0.5 size-5 shrink-0"
                              aria-hidden="true"
                            />
                            <div className="min-w-0">
                              <p style={{ font: 'var(--type-card-title)' }}>
                                Contact your pediatrician
                              </p>
                              <p className="mt-[var(--space-12)]">
                                {message.content}
                              </p>
                            </div>
                          </div>
                        </Callout>
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
                        {new Date().toLocaleTimeString([], {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
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

      <StandingDisclaimer text={ASK_DISCLAIMER} />

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
            placeholder="Ask Bloom something…"
            aria-label="Ask Bloom a question"
            className="w-full rounded-full border border-[var(--border-subtle)] bg-[var(--card-primary)] px-4 py-3 pr-12 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] focus:border-[var(--border-card)]"
          />

          {dictation.supported ? (
            <button
              type="button"
              onClick={dictation.toggle}
              disabled={loading}
              aria-label={
                dictation.listening ? 'Stop dictating' : 'Dictate your question'
              }
              aria-pressed={dictation.listening}
              className={`absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full transition disabled:opacity-40 ${
                dictation.listening
                  ? 'text-[var(--text-accent-terracotta)]'
                  : 'text-[var(--text-secondary)]'
              }`}
            >
              <Mic className="size-5" aria-hidden />
            </button>
          ) : null}
        </div>

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
