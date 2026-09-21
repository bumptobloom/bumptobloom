# Offline: what is cached and what is not

Written for #184. The service worker is `apps/web/src/app/sw.ts`, and its
precache list is built in `apps/web/src/app/serwist/[path]/route.ts`.

## The rule

**Nothing a signed-in mother sees is ever stored on the phone.** A phone can
be shared, and a cached Home screen could show one mother another mother's
baby. So the worker stores the app's public files and nothing else.

## Cached (precached at install, replaced on every deploy)

| What | Why |
|---|---|
| Build assets under `/_next/static/` (JavaScript, CSS, fonts) | The app's code and look. The same for every user. |
| Files in `public/` (logo, app icons) | Added automatically by Serwist. Do not list them again in `route.ts`: a duplicate entry stops the worker loading at all. |
| `/~offline` | The page shown when there is no network. It is static and has no session, baby or account data on it. |

## Never cached

| What | Why |
|---|---|
| Any page in `(app)/`: Home, Track, Learn, Ask, Vitals, Recommended | They show one family's data. Page loads always go to the network (`NetworkOnly`) and are never stored. |
| Any Supabase response | Health and baby data. Reading it needs a network, and that is fine. |
| `/api/*` (including Ask) | Needs the server and the OpenAI key. |
| The login and signup pages | Always fetched fresh, so an old copy never lingers. |

## What a mother sees with no network

Opening the installed app, or any page in it, shows our own offline page at
the address she asked for, not the browser's error page. "Try again" reloads
that same address. Once the network is back, the real page loads.

Saving a reading with no network fails and the data layer throws, so the
screen can say so. Nothing is queued to send later. That would be a
deliberate feature, not a default.

## Changing this

Adding anything to the cache is a decision, not a tidy-up. Before caching a
new kind of response, check that it contains nothing tied to an account, and
say why in the PR. Never cache a signed-in page.

## How this was tested

On a production build in Chromium at 390px: install the worker online, then
stop the server entirely and open `/vitals`, `/home`, `/track`, `/login`,
`/ask` and `/recommended`. Each showed the offline page at its own address,
and the cache held only the files listed above.

Playwright's `context.setOffline(true)` does not cut off requests made by the
service worker itself, so it gives misleading results here. Stop the server
instead, or use airplane mode on a real phone.
