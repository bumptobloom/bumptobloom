import { cn } from '@/lib/utils';

/**
 * The BumpToBloom B. Drawn here rather than imported, because design has not
 * yet exported the SVG from Figma 00a. When that asset lands, replace this
 * component and both the auth lockup and the app header follow.
 */
export function BloomB({ className }: { className?: string }) {
  return (
    <span className={cn('relative inline-block leading-none', className)} aria-hidden>
      <span className="block leading-none text-[var(--text-brand)]">B</span>
      <span className="absolute right-[0.15em] top-[0.18em] h-[0.1em] w-[0.1em] rounded-full bg-[var(--brand-primary)]" />
      <span className="absolute right-[0.32em] top-[0.36em] h-[0.07em] w-[0.07em] rounded-full bg-[var(--text-accent-terracotta)]/70" />
    </span>
  );
}

/**
 * The centred lockup used on every signed-out screen, per Figma 00a / 00b.
 */
export function BrandMark({ tagline = true }: { tagline?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <BloomB className="text-[4.25rem]" />
      <p className="text-[1.55rem] leading-none text-[var(--text-primary)]">
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
