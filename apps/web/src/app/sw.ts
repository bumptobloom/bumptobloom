/// <reference lib="webworker" />
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}
declare const self: ServiceWorkerGlobalScope;

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
});

serwist.addEventListeners();