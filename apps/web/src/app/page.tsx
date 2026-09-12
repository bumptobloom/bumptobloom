import { redirect } from 'next/navigation';

/**
 * `/` is Home. The screens live under the (app) route group so the tab bar
 * layout wraps them, which means the root route is a redirect rather than a
 * page of its own.
 */
export default function RootPage() {
  redirect('/home');
}
