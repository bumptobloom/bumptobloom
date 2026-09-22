import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * Jennifer's approved brand mark. The supplied SVG contains an embedded
 * 2400px artwork export, so it has ample resolution at every in-app size even
 * though the source is not made from editable vector paths.
 */
export function BloomB({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/b2blogo.svg"
      alt=""
      width={576}
      height={576}
      className={cn('shrink-0 object-contain', className)}
      unoptimized
    />
  );
}

/**
 * The centred lockup used on every signed-out screen, per Figma 00a / 00b.
 */
export function BrandMark({ tagline = true }: { tagline?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <BloomB className="size-28" />
      <p className="font-display text-[1.55rem] leading-none text-[var(--text-primary)]">
        BumpToBloom
      </p>
      {tagline && (
        <p className="mt-1 max-w-[18rem] text-[0.8rem] leading-[1.6] text-[var(--text-secondary)]">
          A trusted, personalized companion &mdash; guiding first-time moms
          from pregnancy through your child&apos;s first two years.
        </p>
      )}
    </div>
  );
}
