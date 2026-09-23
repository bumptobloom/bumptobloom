import { NotebookPen } from 'lucide-react';
import { isFeverRange } from '@btb/fever-rules';
import type { TemperatureReading } from '@/lib/api/types';
import { METHOD_LABELS } from './methods';

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/**
 * Figma frame 07, "Today's readings". Today only, newest first, which is what
 * getTodaysTemperatures() returns.
 *
 * The "Fever range" pill is a label and not a judgement: isFeverRange() gives a
 * boolean and nothing else, and Vitals never calls assessFever(). ADR-007. The
 * screen disclaimer is what makes the label permissible, so the two ship
 * together or not at all.
 *
 * Frame 08 shows a chevron on every row and frame 07 shows none. Nobody has
 * said what tapping it opens, so it is left out rather than built as a control
 * that goes nowhere. Asked in #btb-all on 23 Sep.
 */
export function TodaysReadings({ readings }: { readings: TemperatureReading[] }) {
  return (
    <section className="w-full rounded-[var(--radius-16)] border border-[var(--border-card)] bg-[var(--card-primary)] p-[var(--space-20)]">
      <h2
        className="uppercase tracking-wide text-[var(--text-brand)]"
        style={{ font: 'var(--type-eyebrow)' }}
      >
        Today&apos;s readings
      </h2>

      {readings.length === 0 ? (
        <p
          className="mt-[var(--space-16)] text-[var(--text-secondary)]"
          style={{ font: 'var(--type-body)' }}
        >
          No readings yet today.
        </p>
      ) : (
        <ul className="mt-[var(--space-8)]">
          {readings.map((reading, index) => {
            const feverish = isFeverRange(reading.tempF, reading.method);

            return (
              <li
                key={reading.id}
                className={
                  index === 0
                    ? 'py-[var(--space-16)]'
                    : 'border-t border-[var(--border-subtle)] py-[var(--space-16)]'
                }
              >
                <div className="flex items-center gap-[var(--space-12)]">
                  <span
                    className="shrink-0 text-[var(--text-secondary)]"
                    style={{ font: 'var(--type-body)' }}
                  >
                    {formatTime(reading.takenAt)}
                  </span>

                  <span
                    className={
                      feverish
                        ? 'shrink-0 font-semibold text-[var(--text-alert)]'
                        : 'shrink-0 font-semibold text-[var(--text-primary)]'
                    }
                    style={{ font: 'var(--type-body)' }}
                  >
                    {reading.tempF.toFixed(1)}&deg;F
                  </span>

                  {reading.notes ? (
                    <NotebookPen
                      aria-hidden
                      className="size-4 shrink-0 text-[var(--text-brand)]"
                    />
                  ) : null}

                  {feverish ? (
                    <span
                      className="shrink-0 rounded-[var(--radius-pill)] bg-[var(--surface-alert)] px-[var(--space-10)] py-[var(--space-2)] text-[var(--text-alert)]"
                      style={{ font: 'var(--type-eyebrow)' }}
                    >
                      Fever range
                    </span>
                  ) : null}

                  <span
                    className="ml-auto shrink-0 text-[var(--text-secondary)]"
                    style={{ font: 'var(--type-body)' }}
                  >
                    {METHOD_LABELS[reading.method]}
                  </span>
                </div>

                {/* The design saves a note but never shows one. Until the
                    chevron question is answered, showing it here is the only
                    way she can read back what she wrote. */}
                {reading.notes ? (
                  <p
                    className="mt-[var(--space-6)] text-[var(--text-secondary)]"
                    style={{ font: 'var(--type-body)' }}
                  >
                    {reading.notes}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
