/**
 * Home loading state (#87: "a skeleton, not a spinner on blank").
 *
 * Next.js shows this while the Home page's data is on its way. The blocks
 * follow the shape of the real screen - date line, baby card, guidance card,
 * then the three action cards - so nothing jumps when the content arrives.
 * It carries no real data and no links.
 */
function Bar({ className }: { className: string }) {
  return <div className={`rounded-full bg-[var(--border-subtle)] ${className}`} />;
}

function CardShell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[var(--radius-16)] border border-[var(--border-card)] bg-[var(--card-primary)] ${className}`}
    >
      {children}
    </div>
  );
}

export default function HomeLoading() {
  return (
    <section role="status" aria-busy="true" className="flex flex-col gap-[var(--space-20)]">
      <span className="sr-only">Loading your home screen…</span>

      <div aria-hidden className="flex flex-col gap-[var(--space-20)] motion-safe:animate-pulse">
        {/* Date line */}
        <Bar className="h-5 w-48" />

        {/* Baby card */}
        <CardShell className="flex min-h-[110px] items-center gap-[var(--space-14)] p-[var(--space-16)]">
          <div className="size-16 shrink-0 rounded-[var(--radius-16)] bg-[var(--border-subtle)]" />
          <div className="flex flex-1 flex-col gap-[var(--space-8)]">
            <Bar className="h-5 w-32" />
            <Bar className="h-3 w-40" />
          </div>
        </CardShell>

        {/* This week, for you */}
        <CardShell className="flex flex-col gap-[var(--space-12)] p-[var(--space-20)]">
          <Bar className="h-3 w-28" />
          <Bar className="h-4 w-full" />
          <Bar className="h-4 w-11/12" />
          <Bar className="h-4 w-2/3" />
        </CardShell>

        {/* Vitals, Ask Bloom, Recommended for You */}
        {[0, 1, 2].map((card) => (
          <CardShell
            key={card}
            className="flex min-h-[102px] items-center gap-[var(--space-12)] p-[var(--space-20)]"
          >
            <div className="size-6 shrink-0 rounded-full bg-[var(--border-subtle)]" />
            <div className="flex flex-1 flex-col gap-[var(--space-8)]">
              <Bar className="h-4 w-36" />
              <Bar className="h-4 w-full" />
            </div>
          </CardShell>
        ))}

        {/* Standing disclaimer */}
        <div className="flex flex-col items-center gap-[var(--space-8)]">
          <Bar className="h-3 w-full" />
          <Bar className="h-3 w-3/4" />
        </div>
      </div>
    </section>
  );
}
