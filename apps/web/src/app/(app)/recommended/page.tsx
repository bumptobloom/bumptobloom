import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { deriveAgeMonths } from '@btb/shared';
import { getHome } from '@/lib/api/home';
import { getRecommendations } from '@/lib/api/recommendations';
import { StandingDisclaimer } from '@/components/standing-disclaimer';

export const dynamic = 'force-dynamic';

/**
 * Figma frame 09, "Shop, Recommended Products".
 *
 * The frame labels this group "Shop", but the tab bar on it still highlights
 * Home. It is not a sixth tab; it is reached from the Home card, which is what
 * the route already does.
 *
 * The card is not itself a link. "View Product" is the control the frame
 * draws, and nesting a button inside a link is a real problem for anyone
 * using a screen reader or a keyboard.
 */
export default async function RecommendedPage() {
  const home = await getHome();

  if (!home.baby) {
    redirect('/onboarding');
  }

  const recommendations = await getRecommendations(home.baby.id);
  const months = deriveAgeMonths(home.baby.birthDate);

  return (
    <section className="flex flex-col gap-[var(--space-20)]">
      <header>
        <div className="relative flex items-center justify-center">
          <Link
            href="/home"
            aria-label="Back"
            className="absolute left-0 flex size-11 items-center justify-center text-[var(--text-primary)]"
          >
            <ArrowLeft className="size-5" aria-hidden />
          </Link>
          <h1 className="text-[var(--text-primary)]" style={{ font: 'var(--type-label)' }}>
            Recommended for You
          </h1>
        </div>
        <p
          className="mt-[var(--space-12)] text-[var(--text-secondary)]"
          style={{ font: 'var(--type-small-title)' }}
        >
          Essentials for Month {months}
        </p>
      </header>

      <div className="flex flex-col gap-[var(--space-16)]">
        {recommendations.products.map((product) => (
          <article
            key={product.id}
            className="rounded-[var(--radius-16)] border border-[var(--border-card)] bg-[var(--card-primary)] p-[var(--space-16)]"
          >
            <div className="flex gap-[var(--space-16)]">
              <div
                aria-hidden
                className="size-16 shrink-0 rounded-[var(--radius-12)] bg-[var(--surface-terra)]"
              />
              <div className="min-w-0">
                <h2 className="text-[var(--text-primary)]" style={{ font: 'var(--type-label)' }}>
                  {product.name}
                </h2>
                <p
                  className="mt-[var(--space-4)] text-[var(--text-secondary)]"
                  style={{ font: 'var(--type-body)' }}
                >
                  {product.rationale}
                </p>
              </div>
            </div>

            <Link
              href={`/recommended/${product.id}`}
              className="mt-[var(--space-12)] inline-flex min-h-11 items-center gap-[var(--space-8)] rounded-[var(--radius-pill)] bg-[var(--surface-moss)] px-[var(--space-16)] text-[var(--text-brand)]"
              style={{ font: 'var(--type-label)' }}
            >
              View Product
              <ExternalLink className="size-4" aria-hidden />
            </Link>
          </article>
        ))}
      </div>

      <StandingDisclaimer text={recommendations.disclaimer} />
    </section>
  );
}
