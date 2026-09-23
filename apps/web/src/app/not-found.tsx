import { SearchX } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { ErrorState } from '@/components/error-state';

/**
 * Figma frame "03 Home, Error: Page not found (404)".
 *
 * This is the root not-found, so it catches any URL that matches no route,
 * including ones outside the (app) group. The frame shows the header and the
 * tab bar, so it renders inside AppShell. AppShell does not itself require a
 * session; the (app) layout is what does that.
 */
export default function NotFound() {
  return (
    <AppShell>
      <ErrorState
        icon={<SearchX className="size-16" aria-hidden strokeWidth={1.5} />}
        title="Page not found"
        body={'The page you’re looking for doesn’t exist or has moved.'}
        actionLabel="Go to home"
        actionHref="/home"
      />
    </AppShell>
  );
}
