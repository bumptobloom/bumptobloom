/**
 * An honest placeholder. It says what the tab will be and that it is not built
 * yet. It does not render a fake list, a skeleton that never resolves, or a
 * number over an invented denominator.
 */
export function TabPlaceholder({ title, note }: { title: string; note: string }) {
  return (
    <section className="flex flex-col gap-3">
      <h1 className="text-[26px] font-semibold" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h1>
      <p
        className="rounded-[18px] border px-4 py-4 text-[15px] leading-relaxed"
        style={{
          background: 'var(--card-secondary)',
          borderColor: 'var(--border-card)',
          color: 'var(--text-secondary)',
        }}
      >
        {note}
      </p>
    </section>
  );
}
