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
    <div className="flex min-w-0 items-center gap-[var(--space-8)]">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--card-primary)] text-[var(--text-brand)]">
        {icon}
      </span>
      <div className="min-w-0">
        {/* Equal halves, and the label may wrap. Forcing one line with
            unequal widths made the row wider than the card on a phone, so
            "Total Readings" ran off the right edge (PM defect, 3 Oct). */}
        <p className="text-[0.875rem] leading-[1.25] text-[var(--text-secondary)]">
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
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-[var(--space-12)]">
        <Stat
          icon={<Thermometer className="size-5" aria-hidden />}
          label="Highest Recorded"
          value={highest === null ? '—' : `${highest.toFixed(1)}°F`}
          alert={highestIsFeverish}
        />
        <span aria-hidden className="w-px self-stretch bg-[var(--text-brand)]/20" />
        <Stat
          icon={<Clock className="size-5" aria-hidden />}
          label="Total Readings"
          value={String(summary.count)}
        />
      </div>
    </Callout>
  );
}
