import { TrackPageView } from '@/components/track-page-view';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getHome } from '@/lib/api/home';
import { getRecommendations } from '@/lib/api/recommendations';
import { StandingDisclaimer } from '@/components/standing-disclaimer';

export const dynamic = 'force-dynamic';

export default async function RecommendedPage() {
  const home = await getHome();

  if (!home.baby) {
    redirect('/onboarding');
  }

  const recommendations = await getRecommendations(home.baby.id);
  const currentMonth = Math.floor(recommendations.ageMonths);
  const firstMonth = Math.max(0, Math.min(19, currentMonth - 2));
  const visibleMonths = Array.from(
    { length: 6 },
    (_, index) => firstMonth + index,
  );

  return (
    <section className="flex flex-col gap-5">
      <TrackPageView event="recommendations_viewed" />
      <header>
        <h1
          className="text-[24px] font-semibold leading-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          Recommended for You
        </h1>

        <p
          className="mt-2 text-[17px]"
          style={{ color: 'var(--text-secondary)' }}
        >
          Essentials for Month {currentMonth}
        </p>

        <div className="mt-8 flex items-center justify-between">
          {visibleMonths.map((month) => {
            const active = month === currentMonth;

            return (
              <div
                key={month}
                className={`flex flex-col items-center ${
                  active ? 'font-semibold' : ''
                }`}
                style={{ color: 'var(--text-primary)' }}
              >
                <span
                  className={`flex size-12 items-center justify-center rounded-full ${
                    active ? 'border-2 border-[var(--text-brand)]' : ''
                  }`}
                >
                  {month}
                </span>

                <span className="text-xs">mo</span>

                {active ? (
                  <span className="mt-1 h-1 w-8 rounded-full bg-[var(--text-brand)]" />
                ) : null}
              </div>
            );
          })}
        </div>
      </header>

      <div className="flex flex-col gap-4">
        {recommendations.products.map((product) => (
          <Link
            key={product.id}
            href={`/recommended/${product.id}`}
            className="flex gap-4 rounded-[18px] border p-4"
            style={{ background: 'var(--card-primary)', borderColor: 'var(--border-card)' }}
          >
            <div
              aria-hidden
              className="flex size-16 shrink-0 items-center justify-center rounded-[12px] bg-[var(--surface-terra)] text-3xl"
            >
              {product.emoji}
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                {product.name}
              </h2>
              <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {product.rationale}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <StandingDisclaimer text={recommendations.disclaimer} />
    </section>
  );
}
