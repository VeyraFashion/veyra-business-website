/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: process.cwd(),
  // Local demos are commonly opened as either localhost or 127.0.0.1. Next's
  // dev-origin protection otherwise serves the HTML but blocks its client chunks,
  // leaving interactive and animated sections unable to hydrate.
  allowedDevOrigins: ["localhost", "127.0.0.1"],
};

export default nextConfig;
