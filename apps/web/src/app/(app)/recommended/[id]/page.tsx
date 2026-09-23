import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Check, ExternalLink, Sparkles, X } from 'lucide-react';
import { deriveAgeMonths } from '@btb/shared';
import { getHome } from '@/lib/api/home';
import { getProduct } from '@/lib/api/recommendations';
import { StandingDisclaimer } from '@/components/standing-disclaimer';

export const dynamic = 'force-dynamic';

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

/** "at 18 months", matching the Figma heading. */
function ageForHeading(months: number): string {
  if (months === 0) return 'in the first month';
  return `at ${months} month${months === 1 ? '' : 's'}`;
}

/**
 * Figma frame 10, "Shop, Product Detail".
 *
 * The frame draws this as a sheet over the list, with a title bar and a close
 * control. It is a route rather than an intercepting-route modal, because the
 * close affordance and the layout are what the design is actually specifying
 * and a real modal is a much larger change for no visible difference.
 *
 * The frame shows no price, so none is rendered. The data layer still carries
 * indicativePriceCents; this is a display decision and it is reversible.
 */
export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const [home, product] = await Promise.all([getHome(), getProduct(id)]);

  if (!home.baby) {
    redirect('/onboarding');
  }

  const months = deriveAgeMonths(home.baby.birthDate);
  const singleRetailer = product.retailers.length === 1;

  return (
    <section className="flex flex-col gap-[var(--space-20)]">
      <header className="relative flex items-center justify-center">
        <h1 className="text-[var(--text-primary)]" style={{ font: 'var(--type-label)' }}>
          Product Details
        </h1>
        <Link
          href="/recommended"
          aria-label="Close"
          className="absolute right-0 flex size-11 items-center justify-center text-[var(--text-primary)]"
        >
          <X className="size-5" aria-hidden />
        </Link>
      </header>

      <div
        aria-hidden
        className="aspect-square w-full rounded-[var(--radius-16)] bg-[var(--surface-terra)]"
      />

      <div>
        <h2 className="text-[var(--text-primary)]" style={{ font: 'var(--type-card-title)' }}>
          {product.name}
        </h2>
        <p
          className="mt-[var(--space-8)] text-[var(--text-secondary)]"
          style={{ font: 'var(--type-body)' }}
        >
          {product.description}
        </p>
      </div>

      <div className="w-full rounded-[var(--radius-16)] bg-[var(--surface-moss)] p-[var(--space-20)]">
        <p
          className="flex items-center gap-[var(--space-8)] text-[var(--text-primary)]"
          style={{ font: 'var(--type-label)' }}
        >
          <Sparkles className="size-4 shrink-0 text-[var(--text-brand)]" aria-hidden />
          Why it&apos;s helpful {ageForHeading(months)}
        </p>

        <ul className="mt-[var(--space-12)] flex flex-col gap-[var(--space-8)]">
          {product.whyHelpful.map((reason, index) => (
            <li key={index} className="flex items-start gap-[var(--space-8)]">
              <Check
                className="mt-1 size-4 shrink-0 text-[var(--text-brand)]"
                aria-hidden
                strokeWidth={3}
              />
              <span className="text-[var(--text-primary)]" style={{ font: 'var(--type-body)' }}>
                {reason}
              </span>
            </li>
          ))}
        </ul>

        {/* US-010, verbatim from Product. "medical device" is flagged as a
            likely typo for "medical advice", but left as approved pending
            Product confirmation - do not silently correct. */}
        <p
          className="mt-[var(--space-12)] text-[12px] leading-relaxed text-[var(--text-secondary)]"
        >
          Product recommendation are general suggestions and do not replace professional medical device
        </p>
      </div>

      <div className="flex flex-col gap-[var(--space-12)]">
        {product.retailers.map((retailer) => (
          <a
            key={retailer.slug}
            href={retailer.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-12 w-full items-center justify-center gap-[var(--space-8)] rounded-[var(--radius-button-primary)] bg-[var(--brand-secondary)] text-[0.95rem] font-semibold text-[#fffcf4]"
          >
            {singleRetailer ? 'Shop Now' : `Shop Now on ${retailer.name}`}
            <ExternalLink className="size-4" aria-hidden />
          </a>
        ))}
      </div>

      {/* The Figma drops the commission sentence. It stays until somebody
          confirms these are not affiliate links: if they are, the FTC requires
          the disclosure next to the link, and that is not design's call. */}
      <StandingDisclaimer text="Products chosen with your child in mind. BumpToBloom does not manufacture, inspect, or guarantee any third-party product. Please check the product's age and safety information before purchasing. We may earn a small commission at no extra cost to you." />
    </section>
  );
}
