import type { TemperatureMethod, TemperatureReading } from '@/lib/api/types';

const METHOD_LABELS: Record<TemperatureMethod, string> = {
  tympanic: 'Ear',
  axillary: 'Armpit',
  temporal: 'Forehead',
  rectal: 'Rectal',
};

export function TodaysReadings({
  readings,
  timezone,
}: {
  readings: TemperatureReading[];
  timezone: string;
}) {
  return (
    <section aria-labelledby="todays-readings-heading">
      <h2
        id="todays-readings-heading"
        className="mb-[var(--space-12)] text-[var(--text-primary)]"
        style={{ font: 'var(--type-card-title)' }}
      >
        Today&apos;s readings
      </h2>

      {readings.length === 0 ? (
        <p
          className="text-[var(--text-secondary)]"
          style={{ font: 'var(--type-body)' }}
        >
          No readings recorded today.
        </p>
      ) : (
        <div className="flex flex-col gap-[var(--space-8)]">
          {readings.map((reading) => (
            <article
              key={reading.id}
              className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--card-primary)] p-[var(--space-12)]"
            >
              <div className="flex items-center justify-between gap-3">
                <p
                  className="text-[var(--text-primary)]"
                  style={{ font: 'var(--type-card-title)' }}
                >
                  {reading.tempF.toFixed(1)}°F
                </p>
                <time
                  dateTime={reading.takenAt}
                  className="text-[var(--text-secondary)]"
                  style={{ font: 'var(--type-body)' }}
                >
                  {new Date(reading.takenAt).toLocaleTimeString([], {
                    timeZone: timezone,
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </time>
              </div>
              <p
                className="mt-1 text-[var(--text-secondary)]"
                style={{ font: 'var(--type-body)' }}
              >
                {METHOD_LABELS[reading.method]}
                {reading.notes ? ` · ${reading.notes}` : ''}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
