/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: process.cwd(),
  images: {
    remotePatterns: ["files", "products"].map((directory) => ({
      protocol: "https",
      hostname: "cdn.shopify.com",
      port: "",
      pathname: `/s/files/1/0525/1842/0657/${directory}/**`,
    })),
  },
  // Local demos are commonly opened as either localhost or 127.0.0.1. Next's
  // dev-origin protection otherwise serves the HTML but blocks its client chunks,
  // leaving interactive and animated sections unable to hydrate.
  allowedDevOrigins: ["localhost", "127.0.0.1"],
};

export default nextConfig;
