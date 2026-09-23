import { redirect } from 'next/navigation';
import { getHome } from '@/lib/api/home';
import { getTodaysTemperatures } from '@/lib/api/temperature-readings';
import { StandingDisclaimer } from '@/components/standing-disclaimer';
import { TemperatureForm } from '@/components/vitals/temperature-form';
import { TodaysReadings } from '@/components/vitals/todays-readings';
import { TodaysSummary } from '@/components/vitals/todays-summary';
import { VITALS_DISCLAIMER } from '@/components/vitals/disclaimer';

export const dynamic = 'force-dynamic';

/**
 * Vitals, #183. Figma frames 07 and 08.
 *
 * ADR-007: this is a temperature log, not a triage tool. It records a reading,
 * how it was taken and an optional note, and labels a reading as being in the
 * fever range or not. It does not rank, score, colour by severity, or suggest
 * what to do. Anything that would, belongs in a product decision and a
 * clinical review, not here.
 */
export default async function VitalsPage() {
  const home = await getHome();

  // Same as Home and Track: there is no designed screen for a parent with no
  // baby, so she goes to onboarding rather than to something invented.
  if (!home.baby) {
    redirect('/onboarding');
  }

  const { readings, summary } = await getTodaysTemperatures(home.baby.id);

  return (
    <section className="flex flex-col gap-[var(--space-20)]">
      <h1 className="sr-only">Vitals</h1>

      <TodaysSummary summary={summary} readings={readings} />

      <TemperatureForm babyId={home.baby.id} />

      <TodaysReadings readings={readings} />

      <StandingDisclaimer text={VITALS_DISCLAIMER} />
    </section>
  );
}
