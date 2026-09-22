'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle, AlertTriangle, Mic, Send, ThumbsDown, ThumbsUp } from 'lucide-react';
import { BloomB } from '@/components/brand-mark';
import { cn } from '@/lib/utils';
import { useDictation } from './use-dictation';

/**
 * Ask Bloom, built to Figma frame 05 (all five states).
 *
 * Talks to POST /api/ask, which owns the model call, the triage guard and
 * every write -- this component never calls OpenAI and never holds a key.
 *
 * Three rules from ADR-007 and the API contract are enforced here as well as
 * upstream, because this is the screen a worried parent is most likely to
 * mistake for advice:
 *
 *   1. A failed send never produces text. It marks the parent's own bubble as
 *      failed and offers Retry, exactly as the frame draws it. There is no
 *      fallback answer, cached or generated.
 *   2. A triage redirect renders as the safety card, not as a reply, because
 *      it is a refusal plus a route to real help.
 *   3. Only a stored assistant answer can be rated. A refusal cannot.
 */
const GREETING_TITLE = "Hi there! I'm Bloom";

// Frame 05. The five categories, in the PRD's order.
const GREETING_BODY =
  'Ask me anything about feeding, sleeping, diaper and digestion, crying ' +
  'and soothing, mom’s wellbeing.';

type Turn =
  | { kind: 'user'; id: string; text: string; state: 'sent' | 'sending' | 'failed' }
  | { kind: 'answer'; id: string; text: string; at: string; messageId: string | null; rating: 1 | -1 | null }
  | { kind: 'refusal'; id: string; text: string; at: string };

function clockTime(d = new Date()) {
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function Avatar() {
  // Frame 05 draws a lotus badge. We do not have that asset, so the brand
  // mark stands in until design sends it. Asked for 22 Sep.
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-pill)] bg-[var(--surface-moss)]">
      <BloomB className="h-4 w-auto" />
    </span>
  );
}

export function AskChat({ babyId }: { babyId: string }) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [greetedAt] = useState(() => clockTime());
  const endRef = useRef<HTMLDivElement>(null);
  // A plain counter, not Date.now(): turn ids only have to be unique within
  // this list, and a clock read is an impure call React rightly objects to.
  const nextId = useRef(0);
  const dictation = useDictation((text) =>
    setDraft((d) => (d ? `${d} ${text}` : text)),
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [turns, sending]);

  async function send(question: string, retryId?: string) {
    const trimmed = question.trim();
    if (!trimmed || sending) return;

    nextId.current += 1;
    const id = retryId ?? `u${nextId.current}`;

    setTurns((t) =>
      retryId
        ? t.map((x) => (x.id === retryId ? { ...x, state: 'sending' as const } : x))
        : [...t, { kind: 'user', id, text: trimmed, state: 'sending' }],
    );
    if (!retryId) setDraft('');
    setSending(true);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ babyId, conversationId, question: trimmed }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        // The frame marks the question as failed and offers Retry. It does
        // not put words in Bloom's mouth.
        setTurns((t) =>
          t.map((x) => (x.id === id ? { ...x, state: 'failed' as const } : x)),
        );
        return;
      }

      if (data?.conversationId) setConversationId(data.conversationId);

      setTurns((t) => [
        ...t.map((x) => (x.id === id ? { ...x, state: 'sent' as const } : x)),
        data?.redirectedToHealth
          ? { kind: 'refusal' as const, id: `a${id}`, text: data?.answer ?? '', at: clockTime() }
          : {
              kind: 'answer' as const,
              id: `a${id}`,
              text: data?.answer ?? '',
              at: clockTime(),
              messageId: data?.messageId ?? null,
              rating: null,
            },
      ]);
    } catch {
      setTurns((t) => t.map((x) => (x.id === id ? { ...x, state: 'failed' as const } : x)));
    } finally {
      setSending(false);
    }
  }

  async function rate(turnId: string, messageId: string | null, next: 1 | -1) {
    if (!messageId) return;

    const current = turns.find((t) => t.id === turnId);
    const value = current && current.kind === 'answer' && current.rating === next ? null : next;

    // Optimistic: a rating is not worth making her wait, and a failure here
    // costs nothing.
    setTurns((t) =>
      t.map((x) => (x.id === turnId && x.kind === 'answer' ? { ...x, rating: value } : x)),
    );

    try {
      await fetch('/api/ask/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, feedback: value }),
      });
    } catch {
      // Swallowed on purpose. Losing a thumbs-up is not worth an error state.
    }
  }

  const lastUser = [...turns].reverse().find((t) => t.kind === 'user');

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-[var(--space-16)]">
      <div className="flex min-h-0 flex-1 flex-col gap-[var(--space-12)] overflow-y-auto">
        {/* Frame 05: the greeting is Bloom's first turn, not an empty state. */}
        <div className="flex items-start gap-[var(--space-8)]">
          <Avatar />
          <div className="flex-1">
            <div className="rounded-[var(--radius-16)] border border-[var(--border-subtle)] bg-[var(--card-primary)] p-[var(--space-20)]">
              <p className="type-small-title text-[var(--text-primary)]">{GREETING_TITLE}</p>
              <hr className="my-[var(--space-12)] border-[var(--border-subtle)]" />
              <p className="type-body text-[var(--text-primary)]">{GREETING_BODY}</p>
            </div>
            <p className="type-eyebrow mt-[var(--space-6)] normal-case tracking-normal text-[var(--text-secondary)]">
              {greetedAt}
            </p>
          </div>
        </div>

        {turns.map((turn) => {
          if (turn.kind === 'user') {
            return (
              <div key={turn.id} className="flex flex-col items-end">
                <p
                  className={cn(
                    'type-body max-w-[85%] rounded-[var(--radius-16)] bg-[var(--brand-secondary)] px-[var(--space-16)] py-[var(--space-12)] text-white',
                    turn.state === 'sending' && 'opacity-55',
                    turn.state === 'failed' &&
                      'border-2 border-[var(--text-accent-terracotta)]',
                  )}
                >
                  {turn.text}
                </p>

                {turn.state === 'sending' ? (
                  <p className="type-eyebrow mt-[var(--space-6)] normal-case tracking-normal text-[var(--text-secondary)]">
                    Sending&hellip;
                  </p>
                ) : null}

                {turn.state === 'failed' ? (
                  <p className="mt-[var(--space-6)] flex items-center gap-[var(--space-6)]">
                    <AlertCircle
                      className="size-3.5 text-[var(--text-accent-terracotta)]"
                      aria-hidden
                    />
                    <span className="type-eyebrow normal-case tracking-normal text-[var(--text-accent-terracotta)]">
                      Failed to send
                    </span>
                    <button
                      type="button"
                      onClick={() => void send(turn.text, turn.id)}
                      className="type-eyebrow normal-case tracking-normal text-[var(--text-accent-terracotta)] underline underline-offset-2"
                    >
                      Retry
                    </button>
                  </p>
                ) : null}
              </div>
            );
          }

          if (turn.kind === 'refusal') {
            return (
              <div key={turn.id} className="flex items-start gap-[var(--space-8)]">
                <Avatar />
                <div className="flex-1">
                  <div className="rounded-[var(--radius-16)] border border-[var(--text-accent-terracotta)] bg-[var(--surface-alert)] p-[var(--space-20)]">
                    <p className="flex items-center gap-[var(--space-8)]">
                      <AlertTriangle
                        className="size-4 shrink-0 text-[var(--text-alert)]"
                        aria-hidden
                      />
                      <span className="type-label text-[var(--text-alert)]">
                        Contact your pediatrician
                      </span>
                    </p>
                    <p className="type-body mt-[var(--space-12)] text-[var(--text-alert)]">
                      {turn.text}
                    </p>
                  </div>
                  <p className="type-eyebrow mt-[var(--space-6)] normal-case tracking-normal text-[var(--text-secondary)]">
                    {turn.at}
                  </p>
                </div>
              </div>
            );
          }

          return (
            <div key={turn.id} className="flex items-start gap-[var(--space-8)]">
              <Avatar />
              <div className="flex-1">
                <p className="type-body rounded-[var(--radius-16)] border border-[var(--border-subtle)] bg-[var(--card-primary)] p-[var(--space-20)] text-[var(--text-primary)]">
                  {turn.text}
                </p>
                <div className="mt-[var(--space-6)] flex items-center gap-[var(--space-10)]">
                  <span className="type-eyebrow normal-case tracking-normal text-[var(--text-secondary)]">
                    {turn.at}
                  </span>
                  {turn.messageId ? (
                    <>
                      <button
                        type="button"
                        aria-label="This answer was helpful"
                        aria-pressed={turn.rating === 1}
                        onClick={() => void rate(turn.id, turn.messageId, 1)}
                        className={cn(
                          'transition',
                          turn.rating === 1
                            ? 'text-[var(--brand-primary)]'
                            : 'text-[var(--text-secondary)] opacity-60',
                        )}
                      >
                        <ThumbsUp className="size-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        aria-label="This answer was not helpful"
                        aria-pressed={turn.rating === -1}
                        onClick={() => void rate(turn.id, turn.messageId, -1)}
                        className={cn(
                          'transition',
                          turn.rating === -1
                            ? 'text-[var(--text-accent-terracotta)]'
                            : 'text-[var(--text-secondary)] opacity-60',
                        )}
                      >
                        <ThumbsDown className="size-4" aria-hidden />
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}

        {sending && lastUser?.state === 'sending' ? (
          <div className="flex items-center gap-[var(--space-8)]" aria-live="polite">
            <Avatar />
            <span className="flex items-center gap-1 rounded-[var(--radius-pill)] border border-[var(--border-subtle)] bg-[var(--card-primary)] px-[var(--space-14)] py-[var(--space-10)]">
              <span className="sr-only">Bloom is replying</span>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="size-1.5 animate-pulse rounded-full bg-[var(--text-secondary)]"
                  style={{ animationDelay: `${i * 160}ms` }}
                />
              ))}
            </span>
          </div>
        ) : null}

        <div ref={endRef} />
      </div>

      <form
        className="flex items-center gap-[var(--space-10)]"
        onSubmit={(e) => {
          e.preventDefault();
          void send(draft);
        }}
      >
        <div className="relative flex-1">
          <label className="sr-only" htmlFor="ask-input">
            Your question
          </label>
          <textarea
            id="ask-input"
            rows={1}
            value={draft}
            disabled={sending}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void send(draft);
              }
            }}
            placeholder="Ask Bloom..."
            className="type-body max-h-32 min-h-[48px] w-full resize-none rounded-[var(--radius-pill)] border border-[var(--border-subtle)] bg-[var(--card-primary)] py-[var(--space-12)] pl-[var(--space-20)] pr-[var(--space-40)] text-[var(--text-primary)] outline-none focus-visible:border-[var(--text-brand)]"
          />
          {dictation.supported ? (
            <button
              type="button"
              onClick={dictation.toggle}
              aria-label={dictation.listening ? 'Stop dictating' : 'Dictate your question'}
              aria-pressed={dictation.listening}
              className={cn(
                'absolute right-[var(--space-14)] top-1/2 -translate-y-1/2 transition',
                dictation.listening
                  ? 'text-[var(--text-accent-terracotta)]'
                  : 'text-[var(--text-secondary)]',
              )}
            >
              <Mic className="size-4" aria-hidden />
            </button>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={sending || !draft.trim()}
          aria-label="Send question"
          className={cn(
            'flex size-[48px] shrink-0 items-center justify-center rounded-[var(--radius-pill)] bg-[var(--brand-secondary)] text-white transition',
            (sending || !draft.trim()) && 'opacity-45',
          )}
        >
          <Send className="size-4" aria-hidden />
        </button>
      </form>
    </div>
  );
}
