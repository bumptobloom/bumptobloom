'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, NotebookPen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { saveTemperatureReadingAction } from '@/app/actions/temperature';
import { MAX_TEMP_F, MIN_TEMP_F } from '@/lib/api/temperature-utils';
import type { TemperatureMethod } from '@/lib/api/types';
import { DEFAULT_METHOD, METHOD_OPTIONS } from './methods';

const fieldClass =
  'w-full rounded-[var(--radius-input)] border border-[var(--border-subtle)] bg-[var(--surface-terra)]/40 px-4 py-3 ' +
  'text-[0.95rem] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none transition ' +
  'focus:border-[var(--text-brand)] focus:ring-2 focus:ring-[var(--text-brand)]/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-brand)]';

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-[var(--space-8)] block text-[var(--text-primary)]"
      style={{ font: 'var(--type-label)' }}
    >
      {children}
    </label>
  );
}

/**
 * Vitals, Figma frames 07 and 08. #183.
 *
 * This records a reading. It does not tell the mother what the reading means,
 * and the save path must never start doing so (ADR-007). The range check below
 * is only to give her a sensible message instead of a database error; the real
 * guards are validateNewReading() and the 0013 check constraint.
 *
 * `timezone` is the parent's own parent_profiles.timezone, handed down by the
 * page. Vitals follows it on the day query, the readings list and this label,
 * so all three agree about what "today" is (Keya's decision, 1 Oct).
 */
export function TemperatureForm({
  babyId,
  timezone,
}: {
  babyId: string;
  timezone: string;
}) {
  const router = useRouter();

  const [tempF, setTempF] = useState('');
  const [method, setMethod] = useState<TemperatureMethod>(DEFAULT_METHOD);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Rendered after mount only, so the clock cannot tick across a minute
  // between the server render and the client one and cause a hydration
  // mismatch.
  //
  // Formatted in the parent's zone, not the browser's. Formatting here with
  // the browser's zone while getTodaysTemperatures picks the day with
  // parent_profiles.timezone is what put "Today, 9:47 PM" above a list of
  // readings stamped 4:47 AM on the #229 preview.
  const [takenAtLabel, setTakenAtLabel] = useState<string | null>(null);

  useEffect(() => {
    function tick() {
      setTakenAtLabel(
        new Intl.DateTimeFormat('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          timeZone: timezone,
        }).format(new Date()),
      );
    }
    tick();
    const timer = setInterval(tick, 30_000);
    return () => clearInterval(timer);
  }, [timezone]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    const parsed = Number(tempF);

    if (tempF.trim() === '' || !Number.isFinite(parsed)) {
      setError('Enter a temperature.');
      return;
    }

    if (parsed < MIN_TEMP_F || parsed > MAX_TEMP_F) {
      setError(
        `That reading is outside ${MIN_TEMP_F}–${MAX_TEMP_F}°F. Check the thermometer and enter it again.`,
      );
      return;
    }

    setSaving(true);

    try {
      await saveTemperatureReadingAction({
        babyId,
        tempF: parsed,
        method,
        notes: notes.trim() === '' ? null : notes,
      });

      setTempF('');
      setNotes('');
      setMethod(DEFAULT_METHOD);
      router.refresh();
    } catch {
      // The underlying message can be a raw Postgres string. She gets
      // something she can act on instead.
      setError('That did not save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col rounded-[var(--radius-16)] border border-[var(--border-card)] bg-[var(--card-primary)] p-[var(--space-20)]"
    >
      <div>
        <FieldLabel htmlFor="temp-f">Add Temperature</FieldLabel>
        <div className="relative">
          <input
            id="temp-f"
            name="tempF"
            type="number"
            inputMode="decimal"
            step="0.1"
            min={MIN_TEMP_F}
            max={MAX_TEMP_F}
            value={tempF}
            onChange={(event) => setTempF(event.target.value)}
            aria-label="Temperature in degrees Fahrenheit"
            aria-describedby={error ? 'temp-error' : undefined}
            className={`${fieldClass} pr-12`}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
            style={{ font: 'var(--type-body)' }}
          >
            &deg;F
          </span>
        </div>
      </div>

      <div className="mt-[var(--space-20)]">
        <FieldLabel htmlFor="temp-method">Add Mode of Measurement</FieldLabel>
        <div className="relative">
          <select
            id="temp-method"
            name="method"
            value={method}
            onChange={(event) => setMethod(event.target.value as TemperatureMethod)}
            aria-label="Measurement method"
            className={`${fieldClass} appearance-none bg-[image:none] pr-12`}
          >
            {METHOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {/* appearance-none removes the platform chevron, and without a
              replacement the field reads as a text input. Frame 07 shows one. */}
          <ChevronDown
            aria-hidden
            className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[var(--text-secondary)]"
          />
        </div>
      </div>

      <div className="mt-[var(--space-20)]">
        <FieldLabel htmlFor="temp-notes">Notes (Optional)</FieldLabel>
        <div className="relative">
          <textarea
            id="temp-notes"
            name="notes"
            rows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            aria-label="Notes (Optional)"
            placeholder="Add any notes about this reading..."
            className={`${fieldClass} resize-none pr-12`}
          />
          <NotebookPen
            aria-hidden
            className="pointer-events-none absolute right-4 top-4 size-4 text-[var(--text-brand)]"
          />
        </div>
      </div>

      {error ? (
        <p
          id="temp-error"
          role="alert"
          className="mt-[var(--space-12)] text-[var(--text-alert)]"
          style={{ font: 'var(--type-body)' }}
        >
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={saving}
        className="mt-[var(--space-20)] h-12 w-full rounded-[var(--radius-button-primary)] bg-[var(--brand-secondary)] text-[0.95rem] text-[#fffcf4] hover:bg-[var(--brand-secondary)]/90"
      >
        {saving ? 'Saving…' : 'Save Reading'}
      </Button>

      <p
        className="mt-[var(--space-12)] text-center text-[var(--text-secondary)]"
        style={{ font: 'var(--type-body)' }}
      >
        {takenAtLabel ? `Today, ${takenAtLabel}` : ' '}
      </p>
    </form>
  );
}
