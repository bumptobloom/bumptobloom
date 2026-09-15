import { BrandMark } from '@/components/brand-mark';

/**
 * Signed-out shell. Mirrors AppShell's phone-width column so that logging in
 * does not change the shape or the colour of the page underneath you.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh w-full bg-[var(--canvas)]">
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-[var(--page-surface)] px-6 pt-12 pb-10">
        <BrandMark />
        <div className="mt-7">{children}</div>
      </div>
    </div>
  );
}
