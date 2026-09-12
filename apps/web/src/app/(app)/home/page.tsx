import Link from 'next/link';
import Image from 'next/image';
import { getHome } from '@/lib/api/home';
import { StandingDisclaimer } from '@/components/standing-disclaimer';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const home = await getHome();

  // Signed in, but no baby registered yet. Home has nothing to derive an age
  // from, so send her to add one rather than rendering an invented state.
  if (!home.baby) {
    return (
      <section className="flex flex-col gap-4">
        <h1 className="text-[26px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          Welcome to BumpToBloom
        </h1>
        <p className="text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Add your baby to see their milestones and what to expect this month.
        </p>
        <Link
          href="/onboarding"
          className="mt-2 inline-flex h-12 items-center justify-center rounded-[var(--radius-button-primary)] px-6 text-[15px] font-semibold"
          style={{ background: 'var(--brand-secondary)', color: '#fffcf4' }}
        >
          Add your baby
        </Link>
        <StandingDisclaimer text={home.disclaimer} />
      </section>
    );
  }

  const { baby, thisWeek, milestoneProgress } = home;

  return (
    <section className="flex flex-col gap-5">
      <header className="flex items-center gap-4">
        {baby.avatarUrl ? (
          <Image
            src={baby.avatarUrl}
            alt=""
            width={56}
            height={56}
            className="size-14 rounded-full object-cover"
            unoptimized
          />
        ) : (
          <div
            aria-hidden
            className="flex size-14 items-center justify-center rounded-full text-[20px] font-semibold"
            style={{ background: 'var(--surface-terra)', color: 'var(--text-accent-terracotta)' }}
          >
            {baby.name.trim().charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-[24px] leading-tight font-semibold" style={{ color: 'var(--text-primary)' }}>
            {baby.name}
          </h1>
          <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
            {baby.ageLabel}
            {baby.dueDate ? ' (corrected for prematurity)' : ''}
          </p>
        </div>
      </header>

      {/* Milestone progress.
          If the checkpoint has no milestones loaded, say so. Do not print a
          fraction over an invented denominator - that is the bug this team
          keeps shipping. */}
      <article
        className="rounded-[18px] border p-5"
        style={{ background: 'var(--card-primary)', borderColor: 'var(--border-card)' }}
      >
        <h2 className="text-[13px] font-semibold tracking-wide uppercase" style={{ color: 'var(--text-secondary)' }}>
          Milestones
        </h2>
        {milestoneProgress && milestoneProgress.total > 0 ? (
          <>
            <p className="mt-2 text-[17px]" style={{ color: 'var(--text-primary)' }}>
              <span className="text-[30px] font-semibold" style={{ color: 'var(--text-brand)' }}>
                {milestoneProgress.noticed}
              </span>{' '}
              of {milestoneProgress.total} noticed at {milestoneProgress.checkpointMonth} months
            </p>
            <div
              className="mt-4 h-2 w-full overflow-hidden rounded-full"
              role="progressbar"
              aria-valuenow={milestoneProgress.noticed}
              aria-valuemin={0}
              aria-valuemax={milestoneProgress.total}
              aria-label={`${milestoneProgress.noticed} of ${milestoneProgress.total} milestones noticed`}
              style={{ background: 'var(--surface-moss)' }}
            >
              <div
                className="h-full rounded-full transition-[width]"
                style={{
                  width: `${(milestoneProgress.noticed / milestoneProgress.total) * 100}%`,
                  background: 'var(--brand-secondary)',
                }}
              />
            </div>
            <Link
              href="/track"
              className="mt-4 inline-block text-[14px] font-semibold underline underline-offset-4"
              style={{ color: 'var(--text-brand)' }}
            >
              Open Track
            </Link>
          </>
        ) : (
          <p className="mt-2 text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            No milestones are loaded for this checkpoint yet.
          </p>
        )}
      </article>

      {/* This week. The content table is empty until the AAP reuse question is
          answered, so the empty state is the state we expect to see. */}
      <article
        className="rounded-[18px] border p-5"
        style={{ background: 'var(--card-secondary)', borderColor: 'var(--border-card)' }}
      >
        <h2 className="text-[13px] font-semibold tracking-wide uppercase" style={{ color: 'var(--text-secondary)' }}>
          This week
        </h2>
        {thisWeek ? (
          <>
            <h3 className="mt-2 text-[18px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              {thisWeek.title}
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {thisWeek.excerpt}
            </p>
            <p className="mt-3 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
              Source:{' '}
              {thisWeek.sourceUrl ? (
                <a
                  href={thisWeek.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2"
                >
                  {thisWeek.sourceLabel}
                </a>
              ) : (
                thisWeek.sourceLabel
              )}
            </p>
          </>
        ) : (
          <p className="mt-2 text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Nothing published for this age yet.
          </p>
        )}
      </article>

      <StandingDisclaimer text={home.disclaimer} />
    </section>
  );
}
