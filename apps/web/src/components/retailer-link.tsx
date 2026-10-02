'use client';

import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';

/**
 * A retailer "Shop Now" link that records amazon_clicked (#50) as the parent
 * leaves for the retailer. Only the catalog product id is sent - never the
 * retailer URL, which can carry affiliate or search parameters.
 */
export function RetailerLink({
  href,
  retailerSlug,
  productId,
  className,
  style,
  children,
}: {
  href: string;
  retailerSlug: string;
  productId: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(className, 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-brand)]')}
      style={style}
      onClick={() => {
        if (retailerSlug === 'amazon') {
          trackEvent('amazon_clicked', { product_id: productId });
        }
      }}
    >
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
