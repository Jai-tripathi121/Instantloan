import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude pdf-parse (and pdfjs-dist) from the bundle so they are loaded
  // via native Node.js require() at runtime instead of being bundled by
  // turbopack. This avoids dynamic require resolution errors and worker
  // path issues that occur when pdfjs-dist is bundled.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],

  // Ensure pdf-parse worker file is included in Next.js standalone output
  // (Vercel uses standalone mode; nft won't auto-detect dynamically loaded workers)
  outputFileTracingIncludes: {
    "/api/analyse-statement": [
      "./node_modules/pdf-parse/dist/**/*",
    ],
    "/api/debug-pdf": [
      "./node_modules/pdf-parse/dist/**/*",
    ],
  },
};

export default nextConfig;
