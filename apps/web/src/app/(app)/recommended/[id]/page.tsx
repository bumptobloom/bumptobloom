import Link from 'next/link';
import { getProduct } from '@/lib/api/recommendations';
import { StandingDisclaimer } from '@/components/standing-disclaimer';

export const dynamic = 'force-dynamic';

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  const priceLabel = (product.indicativePriceCents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return (
    <section className="flex flex-col gap-5">
      <div
        aria-hidden
        className="aspect-square w-full rounded-[18px]"
        style={{ background: 'var(--surface-terra)' }}
      />

      <div>
        <h1 className="text-[24px] leading-tight font-semibold" style={{ color: 'var(--text-primary)' }}>
          {product.name}
        </h1>
        <p className="mt-1 text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {product.description}
        </p>
      </div>

      <article
        className="rounded-[18px] border p-5"
        style={{ background: 'var(--card-secondary)', borderColor: 'var(--border-card)' }}
      >
        <h2 className="text-[13px] font-semibold tracking-wide uppercase" style={{ color: 'var(--text-secondary)' }}>
          Why it&apos;s helpful
        </h2>
        <ul className="mt-3 flex flex-col gap-2">
          {product.whyHelpful.map((reason, index) => (
            <li
              key={index}
              className="text-[15px] leading-relaxed"
              style={{ color: 'var(--text-primary)' }}
            >
              {reason}
            </li>
          ))}
        </ul>
        {/* US-010, verbatim from Product. "medical device" is flagged as a
            likely typo for "medical advice", but left as approved pending
            Product confirmation - do not silently correct. */}
        <p className="mt-3 text-[12px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Product recommendation are general suggestions and do not replace professional medical device
        </p>
      </article>

      <p className="text-[18px] font-semibold" style={{ color: 'var(--text-primary)' }}>
        {priceLabel}
      </p>

      {product.retailers.map((retailer) => (
        <a
          key={retailer.slug}
          href={retailer.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-12 items-center justify-center rounded-[var(--radius-button-primary)] px-6 text-[15px] font-semibold"
          style={{ background: 'var(--brand-secondary)', color: '#fffcf4' }}
        >
          Shop Now on {retailer.name}
        </a>
      ))}

      <Link
        href="/recommended"
        className="text-[14px] font-semibold underline underline-offset-4"
        style={{ color: 'var(--text-brand)' }}
      >
        Back to Recommended
      </Link>

      <StandingDisclaimer text="Products chosen with your child in mind. BumpToBloom does not manufacture, inspect, or guarantee any third-party product. Please check the product's age and safety information before purchasing. We may earn a small commission at no extra cost to you." />
    </section>
  );
}
