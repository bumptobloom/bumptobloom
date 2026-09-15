/**
 * The BumpToBloom lockup used on every signed-out screen: the B mark, the
 * wordmark, and the product tagline, per Figma 00a / 00b.
 *
 * The mark is drawn here rather than imported, because design has not yet
 * exported the SVG from the Figma. When that asset lands, replace BloomB
 * and nothing else needs to change.
 */
function BloomB() {
  return (
    <div className="relative inline-block leading-none" aria-hidden>
      <span className="block text-[4.25rem] leading-none text-[var(--text-brand)]">
        B
      </span>
      <span className="absolute right-[0.15em] top-[0.18em] h-[0.42rem] w-[0.42rem] rounded-full bg-[var(--brand-primary)]" />
      <span className="absolute right-[0.32em] top-[0.36em] h-[0.3rem] w-[0.3rem] rounded-full bg-[var(--text-accent-terracotta)]/70" />
    </div>
  );
}

export function BrandMark({ tagline = true }: { tagline?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <BloomB />
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
