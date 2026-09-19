import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Pencil, Thermometer, MessageCircle, ShoppingBag } from 'lucide-react';
import { getHome } from '@/lib/api/home';
import { StandingDisclaimer } from '@/components/standing-disclaimer';
import { getMonthTypical } from '@/lib/api/month-guidance';

export const dynamic = 'force-dynamic';

/** "Tuesday, September 1st" — the format PRD US-001 asks for. */
function formatToday(now: Date): string {
  const weekday = now.toLocaleDateString('en-US', { weekday: 'long' });
  const month = now.toLocaleDateString('en-US', { month: 'long' });
  const d = now.getDate();
  const suffix =
    d % 10 === 1 && d !== 11 ? 'st'
    : d % 10 === 2 && d !== 12 ? 'nd'
    : d % 10 === 3 && d !== 13 ? 'rd'
    : 'th';
  return `${weekday}, ${month} ${d}${suffix}`;
}

/** Add months to a date, clamping to the last valid day of the target month. */
function addMonthsClamped(from: Date, months: number): Date {
  const d = new Date(from);
  const targetDay = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const daysInTargetMonth = new Date(
    d.getFullYear(),
    d.getMonth() + 1,
    0,
  ).getDate();
  d.setDate(Math.min(targetDay, daysInTargetMonth));
  return d;
}

/**
 * "MONTH 18, DAY 7" — US-002 asks for months and days. Derived here rather
 * than in calculateBabyAge so the shared age label used elsewhere is unchanged.
 *
 * Month ends are the whole difficulty. `setMonth` overflows when the target
 * month is shorter (31 Jan plus one month lands on 3 Mar, not 28 Feb), and a
 * naive `now.getDate() < birth.getDate()` check under-counts, because a baby
 * born on the 31st has completed a month by 28 Feb — there is no 31 Feb to
 * wait for. So: take the optimistic month count, build the clamped
 * anniversary, and step back one month only if that date is still ahead.
 */
function completedMonths(birthDate: string, now: Date): number {
  const birth = new Date(`${birthDate}T00:00:00`);
  let months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());
  if (addMonthsClamped(birth, months).getTime() > now.getTime()) months -= 1;
  return Math.min(24, Math.max(0, months));
}

function monthAndDay(birthDate: string, now: Date): string {
  const birth = new Date(`${birthDate}T00:00:00`);

  let months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());

  let anniversary = addMonthsClamped(birth, months);
  if (anniversary.getTime() > now.getTime()) {
    months -= 1;
    anniversary = addMonthsClamped(birth, months);
  }
  months = Math.max(0, months);

  const days = Math.max(
    0,
    Math.floor((now.getTime() - anniversary.getTime()) / 86_400_000),
  );

  return `MONTH ${months}, DAY ${days}`;
}

/** Figma 03 reads "essentials for Emma at 18 months". `ageLabel` returns
 *  "Newborn" under one month, which makes that sentence read "at Newborn". */
function ageForCopy(birthDate: string, now: Date): string {
  const birth = new Date(`${birthDate}T00:00:00`);
  let months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) months -= 1;
  months = Math.max(0, months);

  if (months === 0) return 'in the first month';
  return `at ${months} month${months === 1 ? '' : 's'}`;
}

export default async function HomePage() {
  const home = await getHome();
  const now = new Date();

  // Signed in with no baby. There is no Figma screen for this state, so we do
  // not invent one -- onboarding is where she belongs and it is designed.
  if (!home.baby) {
    redirect('/onboarding');
  }

  const { baby } = home;

  // US-004. Same month_guidance row Track and Learn read, so the three
  // screens cannot disagree about what is typical this month.
  const typical = await getMonthTypical(completedMonths(baby.birthDate, now));
  const firstName = baby.name.trim().split(' ')[0];

  return (
    <section className="flex flex-col gap-4">
      <p className="text-[0.85rem] text-[var(--text-secondary)]">{formatToday(now)}</p>

      {/* Baby card, Figma 03. The pencil opens the profile, per US-003. */}
      <article className="flex items-center gap-3.5 rounded-3xl bg-[var(--brand-secondary)] px-4 py-3.5">
        {baby.avatarUrl ? (
          <Image
            src={baby.avatarUrl}
            alt=""
            width={48}
            height={48}
            className="size-12 shrink-0 rounded-full object-cover"
            unoptimized
          />
        ) : (
          <div
            aria-hidden
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--surface-terra)] text-[1.4rem]"
          >
            👶
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[1.15rem] leading-tight text-[var(--card-primary)]">
            {baby.name}
          </h1>
          <p className="mt-0.5 text-[0.68rem] tracking-[0.08em] text-[var(--card-primary)]/75">
            BLOOM · {monthAndDay(baby.birthDate, now)}
          </p>
        </div>
        <Link
          href="/onboarding/profile"
          aria-label="Edit baby profile"
          className="shrink-0 text-[var(--card-primary)]/80 transition hover:text-[var(--card-primary)]"
        >
          <Pencil className="size-4" />
        </Link>
      </article>

      {/* This week, for you. The content table is empty until the Learn dataset
          lands, so the empty state is the state we expect to see. */}
      <article className="rounded-3xl border border-[var(--border-card)] bg-[var(--card-primary)] px-5 py-4">
        <h2 className="text-[0.68rem] tracking-[0.08em] text-[var(--text-secondary)]">
          THIS WEEK, FOR YOU
        </h2>
        <p className="mt-2 text-[0.85rem] leading-[1.55] text-[var(--text-secondary)]">
          {typical ?? 'Nothing published for this age yet.'}
        </p>
        {/*
          Settled by Product on 15 Sep: "what is typical" cannot map onto Learn's
          five specific categories, so this card's content comes from the
          milestone dataset and More guidance sends her to Track, not Learn
          (Vishnu and Shailee, PRD US-004 updated). The nav bar is unchanged.

          The copy itself still comes from `content` until Vishnu's milestone
          sheet is imported, which is why the empty state shows today.
        */}
        <Link
          href="/track"
          className="mt-3 inline-block text-[0.85rem] text-[var(--text-brand)]"
        >
          More guidance &rarr;
        </Link>
      </article>

      <Link
        href="/vitals"
        className="flex items-start gap-3 rounded-3xl border border-[var(--border-card)] bg-[var(--surface-terra)]/55 px-5 py-4 transition hover:brightness-[0.98]"
      >
        <Thermometer className="mt-0.5 size-4 shrink-0 text-[var(--text-accent-terracotta)]" aria-hidden />
        <div>
          <h2 className="text-[0.95rem] text-[var(--text-primary)]">Vitals</h2>
          <p className="mt-0.5 text-[0.82rem] leading-[1.5] text-[var(--text-secondary)]">
            Record your child&apos;s temperature, notes, and readings in one place.
          </p>
        </div>
      </Link>

      <Link
        href="/ask"
        className="flex items-start gap-3 rounded-3xl border border-[var(--brand-primary)] bg-[var(--brand-primary)]/85 px-5 py-4 transition hover:brightness-[0.98]"
      >
        <MessageCircle className="mt-0.5 size-4 shrink-0 text-[var(--text-accent-warm)]" aria-hidden />
        <div>
          <h2 className="text-[0.95rem] text-[var(--text-accent-warm)]">Ask Bloom</h2>
          <p className="mt-0.5 text-[0.82rem] leading-[1.5] text-[var(--text-accent-warm)]/85">
            Answers tailored to exactly where you are.
          </p>
        </div>
      </Link>

      <article className="rounded-3xl border border-[var(--border-card)] bg-[var(--card-primary)] px-5 py-4">
        <div className="flex items-start gap-3">
          <ShoppingBag className="mt-0.5 size-4 shrink-0 text-[var(--text-brand)]" aria-hidden />
          <div>
            <h2 className="text-[0.95rem] text-[var(--text-primary)]">Recommended for You</h2>
            <p className="mt-0.5 text-[0.82rem] leading-[1.5] text-[var(--text-secondary)]">
              Age-appropriate essentials for {firstName} {ageForCopy(baby.birthDate, now)}.
            </p>
          </div>
        </div>
        <Link
          href="/recommended"
          className="mt-3 inline-block text-[0.85rem] text-[var(--text-brand)]"
        >
          View recommendations →
        </Link>
      </article>

      <StandingDisclaimer text={home.disclaimer} />
    </section>
  );
}
