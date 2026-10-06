import Link from 'next/link';
import { redirect } from 'next/navigation';
import { TrackPageView } from '@/components/track-page-view';
import { getHome } from '@/lib/api/home';
import { getRecommendations } from '@/lib/api/recommendations';
import { ProductImage } from '@/components/recommended/product-image';
import { MonthStrip } from '@/components/track/month-strip';
import { StandingDisclaimer } from '@/components/standing-disclaimer';

export const dynamic = 'force-dynamic';

/**
 * Recommended for You. Figma 09.
 *
 * The month row is MonthStrip, the same control Track and Learn use, rather
 * than a second hand-rolled one. That gets the clickable months for free and
 * keeps all three screens behaving identically: plain links with a `month`
 * query param, so every month is a real URL a parent can land on or share and
 * it works without JavaScript.
 */
export default async function RecommendedPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const home = await getHome();

  if (!home.baby) {
    redirect('/onboarding');
  }

  const { month: monthParam } = await searchParams;
  const parsed = monthParam === undefined ? undefined : Number(monthParam);

  const recommendations = await getRecommendations(
    home.baby.id,
    home.baby.ageMonths,
    parsed === undefined || Number.isNaN(parsed) ? undefined : parsed,
  );

  const babyMonth = Math.floor(recommendations.ageMonths);
  const month =
    parsed === undefined || Number.isNaN(parsed)
      ? babyMonth
      : Math.min(24, Math.max(0, Math.floor(parsed)));

  const viewingOtherMonth = month !== babyMonth;

  return (
    <section className="flex flex-col gap-[var(--space-20)]">
      <TrackPageView event="recommendations_viewed" />

      <header className="flex flex-col gap-[var(--space-12)]">
        <h1 className="type-card-title text-[var(--text-primary)]">
          Recommended for You
        </h1>

        <p className="type-body text-[var(--text-secondary)]">
          Essentials for Month {month}
        </p>

        <MonthStrip month={month} basePath="/recommended" label="Recommendation month" />

        {viewingOtherMonth ? (
          <Link
            href="/recommended"
            className="type-label self-center rounded text-[var(--text-brand)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-brand)]"
          >
            Back to {babyMonth} months
          </Link>
        ) : null}
      </header>

      {recommendations.products.length === 0 ? (
        <p className="type-body text-[var(--text-secondary)]">
          No products published for {recommendations.bucketLabel} yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-[var(--space-16)]">
          {recommendations.products.map((product) => (
            <li key={product.id}>
              <Link
                href={`/recommended/${product.id}?month=${month}`}
                className="flex gap-[var(--space-16)] rounded-[var(--radius-16)] border border-[var(--border-card)] bg-[var(--card-primary)] p-[var(--space-16)] transition hover:border-[var(--border-subtle)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-brand)]"
              >
                <ProductImage product={product} variant="card" />
                <span className="flex flex-col gap-[var(--space-4)]">
                  <span className="type-label text-[var(--text-primary)]">
                    {product.name}
                  </span>
                  <span className="type-body text-[var(--text-secondary)]">
                    {product.rationale}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <StandingDisclaimer text={recommendations.disclaimer} />
    </section>
  );
}
