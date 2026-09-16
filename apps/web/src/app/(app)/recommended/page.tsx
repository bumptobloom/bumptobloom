import Link from 'next/link';
import { getHome } from '@/lib/api/home';
import { getRecommendations } from '@/lib/api/recommendations';
import { StandingDisclaimer } from '@/components/standing-disclaimer';

export const dynamic = 'force-dynamic';

export default async function RecommendedPage() {
  const home = await getHome();

  if (!home.baby) {
    return (
      <section className="flex flex-col gap-4">
        <h1 className="text-[26px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          Recommended for You
        </h1>
        <p className="text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Add your baby to see age-appropriate recommendations.
        </p>
        <Link
          href="/onboarding"
          className="mt-2 inline-flex h-12 items-center justify-center rounded-[var(--radius-button-primary)] px-6 text-[15px] font-semibold"
          style={{ background: 'var(--brand-secondary)', color: '#fffcf4' }}
        >
          Add your baby
        </Link>
      </section>
    );
  }

  const recommendations = await getRecommendations(home.baby.id);

  return (
    <section className="flex flex-col gap-5">
      <header>
        <h1 className="text-[24px] leading-tight font-semibold" style={{ color: 'var(--text-primary)' }}>
          Recommended for You
        </h1>
        <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
          For {recommendations.bucketLabel}
        </p>
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
              className="size-16 shrink-0 rounded-[12px]"
              style={{ background: 'var(--surface-terra)' }}
            />
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
