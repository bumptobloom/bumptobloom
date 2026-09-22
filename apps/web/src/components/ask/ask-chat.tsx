'use client';

import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { Callout } from '@/components/ui/callout';
import { cn } from '@/lib/utils';

/**
 * The Ask chat surface. Talks to POST /api/ask, which owns the model call,
 * the triage guard and all logging -- this component never calls OpenAI and
 * never holds a key.
 *
 * Two rules from ADR-007 and the API contract are enforced here, not just
 * upstream:
 *
 *   1. A failed request shows a plain "couldn't reach it" message. It never
 *      falls back to cached text, a canned answer, or anything that reads as
 *      medical advice. An unreachable assistant must look unreachable.
 *   2. A triage redirect is rendered as a Safety callout rather than as an
 *      ordinary reply, because it is a refusal plus a route to real help and
 *      should not look like an answer.
 */
type Turn =
  | { role: 'user'; text: string }
  | { role: 'assistant'; text: string; redirected: boolean };

export function AskChat({ babyId }: { babyId: string }) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [turns, sending]);

  async function send(question: string) {
    const trimmed = question.trim();
    if (!trimmed || sending) return;

    setTurns((t) => [...t, { role: 'user', text: trimmed }]);
    setDraft('');
    setError(null);
    setSending(true);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ babyId, conversationId, question: trimmed }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        // The server's message, or a neutral one. Never a substitute answer.
        setError(data?.error ?? "Couldn't reach the assistant. Please try again.");
        return;
      }

      if (data?.conversationId) setConversationId(data.conversationId);

      setTurns((t) => [
        ...t,
        {
          role: 'assistant',
          text: data?.answer ?? '',
          redirected: Boolean(data?.redirectedToHealth),
        },
      ]);
    } catch {
      setError("Couldn't reach the assistant. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-[var(--space-16)]">
      <div className="flex min-h-0 flex-1 flex-col gap-[var(--space-12)] overflow-y-auto">
        {turns.length === 0 && !sending ? (
          <Callout variant="info" eyebrow="Ask Bloom">
            Ask about feeding, sleep, routines or how you&apos;re doing. Answers
            are general guidance for where your baby is right now, not medical
            advice.
          </Callout>
        ) : null}

        {turns.map((turn, i) =>
          turn.role === 'user' ? (
            <p
              key={i}
              className="type-body max-w-[85%] self-end rounded-[var(--radius-16)] bg-[var(--brand-primary)]/85 px-[var(--space-16)] py-[var(--space-12)] text-[var(--text-accent-warm)]"
            >
              {turn.text}
            </p>
          ) : turn.redirected ? (
            <div key={i} className="max-w-[90%] self-start">
              <Callout variant="safety" eyebrow="Please contact your doctor">
                {turn.text}
              </Callout>
            </div>
          ) : (
            <p
              key={i}
              className="type-body max-w-[90%] self-start rounded-[var(--radius-16)] border border-[var(--border-subtle)] bg-[var(--card-primary)] px-[var(--space-16)] py-[var(--space-12)] text-[var(--text-primary)]"
            >
              {turn.text}
            </p>
          ),
        )}

        {sending ? (
          <p
            className="type-body self-start rounded-[var(--radius-16)] border border-[var(--border-subtle)] bg-[var(--card-primary)] px-[var(--space-16)] py-[var(--space-12)] text-[var(--text-secondary)]"
            aria-live="polite"
          >
            Thinking&hellip;
          </p>
        ) : null}

        {error ? (
          <div className="max-w-[90%] self-start" aria-live="assertive">
            <Callout variant="caution" eyebrow="Not sent">
              {error}
            </Callout>
          </div>
        ) : null}

        <div ref={endRef} />
      </div>

      <form
        className="flex items-end gap-[var(--space-8)]"
        onSubmit={(e) => {
          e.preventDefault();
          void send(draft);
        }}
      >
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
          placeholder="Ask a question"
          className="type-body max-h-32 min-h-[44px] flex-1 resize-none rounded-[var(--radius-input)] border border-[var(--border-subtle)] bg-[var(--card-primary)] px-[var(--space-14)] py-[var(--space-10)] text-[var(--text-primary)] outline-none focus-visible:border-[var(--text-brand)]"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          aria-label="Send question"
          className={cn(
            'flex size-[44px] shrink-0 items-center justify-center rounded-[var(--radius-button-primary)] bg-[var(--brand-primary)] text-[var(--text-accent-warm)] transition',
            (sending || !draft.trim()) && 'opacity-45',
          )}
        >
          <Send className="size-4" aria-hidden />
        </button>
      </form>
    </div>
  );
}
