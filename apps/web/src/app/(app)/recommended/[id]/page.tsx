import Link from 'next/link';
import { Check, ExternalLink, Sparkles } from 'lucide-react';
import { getProduct, PRODUCT_DETAIL_DISCLAIMER } from '@/lib/api/recommendations';
import { ProductImage } from '@/components/recommended/product-image';
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

  // Figma 10 has one Shop Now button and no price. Amazon is the MVP
  // retailer, so prefer it; otherwise use whichever retailer is listed first.
  const retailer =
    product.retailers.find((r) => r.slug === 'amazon') ?? product.retailers[0];

  const helpfulTitle =
    month === undefined
      ? "Why it's helpful"
      : month === 0
        ? "Why it's helpful in the first month"
        : `Why it's helpful at ${month} month${month === 1 ? '' : 's'}`;

  return (
    <section className="flex flex-col gap-[var(--space-20)]">
      <TrackPageView event="product_viewed" properties={{ product_id: product.id }} />

      <ProductImage product={product} variant="hero" />

      <div className="flex flex-col gap-[var(--space-8)]">
        <h1 className="type-card-title text-[var(--text-primary)]">{product.name}</h1>

        <p className="type-body text-[var(--text-secondary)]">{product.description}</p>
      </div>

      <article className="rounded-[var(--radius-16)] bg-[var(--surface-moss)] p-[var(--space-20)]">
        <h2 className="type-label flex items-center gap-[var(--space-8)] text-[var(--text-primary)]">
          <Sparkles className="size-4 shrink-0 text-[var(--text-brand)]" aria-hidden />
          {helpfulTitle}
        </h2>
        <ul className="mt-[var(--space-12)] flex flex-col gap-[var(--space-12)]">
          {product.whyHelpful.map((reason) => (
            <li
              key={reason}
              className="type-body flex items-start gap-[var(--space-12)] text-[var(--text-primary)]"
            >
              <span
                aria-hidden
                className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--card-primary)]"
              >
                <Check className="size-3 text-[var(--text-brand)]" />
              </span>
              {reason}
            </li>
          ))}
        </ul>
      </article>

      {retailer ? (
        <RetailerLink
          href={retailer.url}
          retailerSlug={retailer.slug}
          productId={product.id}
          className="type-card-title inline-flex h-14 w-full items-center justify-center gap-[var(--space-8)] rounded-[var(--radius-button-primary)] bg-[var(--brand-secondary)] px-[var(--space-24)] text-[var(--card-primary)]"
        >
          Shop Now
          <ExternalLink className="size-4" aria-hidden />
        </RetailerLink>
      ) : null}

      <Link
        href={backHref}
        className="type-label rounded text-[var(--text-brand)] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-brand)]"
      >
        Back to Recommended
      </Link>

      <StandingDisclaimer text={PRODUCT_DETAIL_DISCLAIMER} />
    </section>
  );
}
