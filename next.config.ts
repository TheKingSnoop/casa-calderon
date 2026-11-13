import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: `next build` writes plain HTML/CSS/JS to `out/`,
  // which is uploaded to S3 and served by CloudFront (see ADR-0002, ADR-0003).
  output: "export",
  // Emit `/members/israel/index.html` instead of `/members/israel.html`,
  // so S3 + CloudFront can serve clean URLs without rewrite functions.
  trailingSlash: true,
  // The default image optimiser needs a server; static export can't use it.
  images: { unoptimized: true },

  // NOTE: create-next-app 16.4 enables `cacheComponents` + `partialPrefetching`,
  // but they rely on Partial Prerendering, which needs a server and fails with
  // `output: "export"` ("PPR cannot be enabled in export mode"). Every page here
  // is fully static at build time, so we don't need them.

  // Tailwind CSS v4 via Turbopack (from create-next-app).
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
