import { redirect } from 'next/navigation';
import { getHome } from '@/lib/api/home';
import { AskChat } from '@/components/ask/ask-chat';
import { StandingDisclaimer } from '@/components/standing-disclaimer';

export const dynamic = 'force-dynamic';

/**
 * Ask Bloom. The question goes to POST /api/ask, which runs the triage guard
 * before any model call and logs the run; nothing about the model lives here.
 *
 * The standing disclaimer is not optional on this screen. ADR-007 requires it
 * wherever developmental or health information is shown, and Ask is the
 * screen a worried parent is most likely to treat as advice.
 */
export default async function AskPage() {
  const home = await getHome();

  // Same as Home, Track and Learn: no designed screen for a parent with no
  // baby, so she goes to onboarding rather than to an invented one.
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
