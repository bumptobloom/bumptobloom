import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * Jennifer's approved brand mark. The supplied SVG contains an embedded
 * 2400px artwork export, so it has ample resolution at every in-app size even
 * though the source is not made from editable vector paths.
<<<<<<< HEAD
 *
 * The file arrived on a square canvas the artwork only fills 22% of, so at
 * any given box the mark rendered about half the size it should. The viewBox
 * is cropped to the measured artwork bounds instead, which costs nothing and
 * needs no re-export. The mark is taller than it is wide, hence 252x306.
=======
>>>>>>> origin/181-temperature-readings-data-layer-and-todays-summary
 */
export function BloomB({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/b2blogo.svg"
      alt=""
<<<<<<< HEAD
      width={252}
      height={306}
=======
      width={576}
      height={576}
>>>>>>> origin/181-temperature-readings-data-layer-and-todays-summary
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
<<<<<<< HEAD
      <BloomB className="h-28 w-auto" />
=======
      <BloomB className="size-28" />
>>>>>>> origin/181-temperature-readings-data-layer-and-todays-summary
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
