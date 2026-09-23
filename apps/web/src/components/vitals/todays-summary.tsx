import { Clock, Thermometer } from 'lucide-react';
import { isFeverRange } from '@btb/fever-rules';
import { Callout } from '@/components/ui/callout';
import type { TemperatureReading, TemperatureSummary } from '@/lib/api/types';

/**
 * Figma frame 07, "Today's summary". Two derived numbers and nothing else.
 *
 * summarizeReadings() takes the highest raw reading, so the method that
 * produced it is looked up here to decide the colour. Colour uses the same
 * boolean as the row pill, so the card and the list can never disagree about
 * the same number.
 */
function Stat({
  icon,
  label,
  value,
  alert = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  alert?: boolean;
}) {
  return (
    <div className="flex flex-1 items-center gap-[var(--space-12)]">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--card-primary)] text-[var(--text-brand)]">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[var(--text-secondary)]" style={{ font: 'var(--type-body)' }}>
          {label}
        </p>
        <p
          className={alert ? 'text-[var(--text-alert)]' : 'text-[var(--text-primary)]'}
          style={{ font: 'var(--type-card-title)' }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export function TodaysSummary({
  summary,
  readings,
}: {
  summary: TemperatureSummary;
  readings: TemperatureReading[];
}) {
  const highest = summary.highestTempF;
  const highestReading =
    highest === null ? undefined : readings.find((reading) => reading.tempF === highest);

  const highestIsFeverish =
    highest !== null && highestReading !== undefined
      ? isFeverRange(highest, highestReading.method)
      : false;

  return (
    <Callout variant="info" eyebrow="Today's summary">
      <div className="flex items-stretch gap-[var(--space-12)]">
        <Stat
          icon={<Thermometer className="size-5" aria-hidden />}
          label="Highest Recorded"
          value={highest === null ? '—' : `${highest.toFixed(1)}°F`}
          alert={highestIsFeverish}
        />
        <span aria-hidden className="w-px shrink-0 bg-[var(--text-brand)]/20" />
        <Stat
          icon={<Clock className="size-5" aria-hidden />}
          label="Total Readings"
          value={String(summary.count)}
        />
      </div>
    </Callout>
  );
}
