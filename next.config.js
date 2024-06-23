import withSerwistInit from "@serwist/next";

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./env.js");

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
});

/** @type {import("next").NextConfig} */
const config = {
  experimental: {
    typedRoutes: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "books.google.com",
        pathname: "/**/content/**",
      },
    ],
  },
  output: "standalone",
};

export default withSerwist(config);
