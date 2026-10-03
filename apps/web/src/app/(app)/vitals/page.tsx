import { redirect } from 'next/navigation';
import { getHome } from '@/lib/api/home';
import { getTodaysTemperatures } from '@/lib/api/temperature-readings';
import { StandingDisclaimer } from '@/components/standing-disclaimer';
import { TemperatureForm } from '@/components/vitals/temperature-form';
import { TodaysReadings } from '@/components/vitals/todays-readings';
import { TodaysSummary } from '@/components/vitals/todays-summary';

export const dynamic = 'force-dynamic';

export default async function VitalsPage() {
  const home = await getHome();

  if (!home.baby) {
    redirect('/onboarding');
  }

  const { readings, summary, timezone } = await getTodaysTemperatures(
    home.baby.id
  );

  return (
    <section className="flex flex-col gap-[var(--space-20)]">
      <h1 className="sr-only">Vitals</h1>

      <TodaysSummary summary={summary} readings={readings} />

      <TemperatureForm babyId={home.baby.id} />

      <TodaysReadings readings={readings} timezone={timezone} />

      <StandingDisclaimer />
    </section>
  );
}