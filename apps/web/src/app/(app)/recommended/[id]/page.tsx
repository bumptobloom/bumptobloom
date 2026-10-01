import Link from 'next/link';
import { getProduct, PRODUCT_DETAIL_DISCLAIMER } from '@/lib/api/recommendations';
import { StandingDisclaimer } from '@/components/standing-disclaimer';
import { TrackPageView } from '@/components/track-page-view';
import { RetailerLink } from '@/components/retailer-link';

export const dynamic = 'force-dynamic';

/**
 * Product detail. Figma 10.
 *
 * The hero used to be an empty tinted square, because every imageUrl in the
 * stub catalogue is an empty string. It now shows the product's own icon at
 * size, and falls back to that icon rather than to nothing when a real
 * imageUrl eventually arrives from #41. Whatever is shown always belongs to
 * the product being viewed.
 *
 * `month` comes through on the query string so Back returns the parent to the
 * month she was browsing instead of dumping her on her baby's current month.
 */
export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ month?: string }>;
}) {
  const { id } = await params;
  const { month: monthParam } = await searchParams;
  const product = await getProduct(id);

  const parsed = monthParam === undefined ? undefined : Number(monthParam);
  const month =
    parsed === undefined || Number.isNaN(parsed)
      ? undefined
      : Math.min(24, Math.max(0, Math.floor(parsed)));

  const backHref = month === undefined ? '/recommended' : `/recommended?month=${month}`;

  const priceLabel = (product.indicativePriceCents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return (
    <section className="flex flex-col gap-[var(--space-20)]">
      <TrackPageView event="product_viewed" properties={{ product_id: product.id }} />

      <div
        aria-hidden
        className="flex aspect-square w-full items-center justify-center rounded-[var(--radius-16)] bg-[var(--surface-terra)] text-[6rem]"
      >
        {product.emoji}
      </div>

      <div className="flex flex-col gap-[var(--space-8)]">
        <h1 className="type-card-title text-[var(--text-primary)]">{product.name}</h1>

        {month === undefined ? null : (
          <p className="type-eyebrow text-[var(--text-brand)]">Month {month}</p>
        )}

        <p className="type-body text-[var(--text-secondary)]">{product.description}</p>
      </div>

      <article className="rounded-[var(--radius-16)] border border-[var(--border-card)] bg-[var(--card-secondary)] p-[var(--space-20)]">
        <h2 className="type-eyebrow text-[var(--text-secondary)]">Why it&apos;s helpful</h2>
        <ul className="mt-[var(--space-12)] flex list-disc flex-col gap-[var(--space-8)] pl-[var(--space-20)]">
          {product.whyHelpful.map((reason) => (
            <li key={reason} className="type-body text-[var(--text-primary)]">
              {reason}
            </li>
          ))}
        </ul>
        {/* US-010, verbatim from Product. "medical device" is flagged as a
            likely typo for "medical advice", but left as approved pending
            Product confirmation - do not silently correct. */}
        <p className="type-eyebrow mt-[var(--space-12)] normal-case tracking-normal text-[var(--text-secondary)]">
          Product recommendation are general suggestions and do not replace professional medical device
        </p>
      </article>

      <p className="type-label text-[var(--text-primary)]">{priceLabel}</p>

      {product.retailers.map((retailer) => (
        <RetailerLink
          key={retailer.slug}
          href={retailer.url}
          retailerSlug={retailer.slug}
          productId={product.id}
          className="type-label inline-flex h-12 items-center justify-center rounded-[var(--radius-button-primary)] bg-[var(--brand-secondary)] px-[var(--space-24)] text-white"
        >
          Shop Now on {retailer.name}
        </RetailerLink>
      ))}

      <Link
        href={backHref}
        className="type-label text-[var(--text-brand)] underline underline-offset-4"
      >
        Back to Recommended
      </Link>

      <StandingDisclaimer text={PRODUCT_DETAIL_DISCLAIMER} />
    </section>
  );
}
