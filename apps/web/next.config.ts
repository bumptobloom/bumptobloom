import { withSerwist } from "@serwist/turbopack";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // packages/fever-rules and packages/shared ship raw TypeScript
  // ("main": "src/index.ts", no build step) so Next has to compile them
  // itself. Without this, the first import of either one fails the build
  // with a parse error that looks like a Vercel problem and is not.
  transpilePackages: ["@btb/fever-rules", "@btb/shared"],
};

export default withSerwist(nextConfig);
