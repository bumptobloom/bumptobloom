import { createSerwistRoute } from "@serwist/turbopack";

// Changes on every deploy, so phones fetch the new offline page.
const revision = process.env.VERCEL_GIT_COMMIT_SHA ?? crypto.randomUUID();

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
  createSerwistRoute({
    swSrc: "src/app/sw.ts",
    nextConfig: {},
    useNativeEsbuild: true,
    // Public pages only. Never add a signed-in page here: on a shared phone a
    // cached screen could show one mother another mother's baby (#184).
    // Files in public/ (the logo, the icons) are precached automatically, so
    // they must not be listed again: a duplicate stops the worker loading.
    additionalPrecacheEntries: [{ url: "/~offline", revision }],
  });
