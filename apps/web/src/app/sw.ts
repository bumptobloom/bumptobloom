/// <reference lib="webworker" />
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { NetworkOnly, Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}
declare const self: ServiceWorkerGlobalScope;

/**
 * What this worker caches is written down in docs/OFFLINE.md (#184). Short
 * version: build assets, the public offline page, the logo. Nothing a
 * signed-in mother sees, and no Supabase response.
 */
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  precacheOptions: { cleanupOutdatedCaches: true },
  // Deliberate, and load-bearing for safety. Together these make a new
  // service worker take over immediately instead of waiting for every tab
  // to close. Our triage rules ship inside the app, so a corrected
  // temperature threshold has to reach an installed app on the next load,
  // not whenever the mother happens to close her last tab.
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  // Page loads always go to the network and are never stored. This route
  // exists only so that a failed page load has something to fall back to.
  runtimeCaching: [
    {
      matcher: ({ request }) => request.mode === "navigate",
      handler: new NetworkOnly(),
    },
  ],
  // With no network, show our own offline page instead of the browser's.
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher: ({ request }) => request.destination === "document",
      },
    ],
  },
});

serwist.addEventListeners();
