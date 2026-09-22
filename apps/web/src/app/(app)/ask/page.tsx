import { redirect } from 'next/navigation';
import { AskChat } from '@/components/ask-chat';
import { StandingDisclaimer } from '@/components/standing-disclaimer';
import { getHome } from '@/lib/api/home';

export const dynamic = 'force-dynamic';

export default async function AskPage() {
  const home = await getHome();

  if (!home.baby) {
    redirect('/onboarding');
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-[var(--space-16)]">
      <h1 className="type-eyebrow text-[var(--text-secondary)]">Ask Bloom</h1>

      <AskChat babyId={home.baby.id} />

      <StandingDisclaimer />
    </section>
  );
}