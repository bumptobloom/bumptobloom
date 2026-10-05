import Image from 'next/image';
import { productIcon } from '@/lib/api/recommendations';

/**
 * The tinted square that sits on a Recommended card (Figma 09) and at the top
 * of a product detail page (Figma 10).
 *
 * Shows the product's own photo when it has one and falls back to the emoji
 * tile when it does not. All current catalogue products have a supplied local
 * photo; the fallback remains for future products without an approved image.
 * See docs/PRODUCT-IMAGES.md.
 *
 * Decorative either way. Both call sites render this immediately beside the
 * product's real name, so the tile is aria-hidden and the image carries an
 * empty alt rather than repeating that name to a screen reader.
 */
export function ProductImage({
  product,
  variant,
}: {
  product: { name: string; imageUrl: string; emoji?: string };
  variant: 'card' | 'hero';
}) {
  const card = variant === 'card';

  const frame = card
    ? 'relative size-16 shrink-0 overflow-hidden rounded-[var(--radius-12)] bg-[var(--surface-terra)] text-3xl'
    : 'relative aspect-square w-full overflow-hidden rounded-[var(--radius-16)] bg-[var(--surface-terra)] text-[6rem]';

  return (
    <span aria-hidden className={`flex items-center justify-center ${frame}`}>
      {product.imageUrl ? (
        <Image
          src={product.imageUrl}
          alt=""
          fill
          // object-cover, because the sheet mixes clean product shots with
          // lifestyle photos and they do not share an aspect ratio. Letting
          // them letterbox inside the tile looked broken next to the ones
          // that happen to be square.
          className="object-cover"
          sizes={card ? '64px' : '(max-width: 480px) 100vw, 430px'}
        />
      ) : (
        productIcon(product)
      )}
    </span>
  );
}
