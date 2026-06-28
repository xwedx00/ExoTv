/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Next 16.2 (Turbopack) dev "static indicator" crashes its HMR handler on the
  // `isrManifest` message ("Cannot read properties of undefined (reading
  // 'components')"), which breaks Fast Refresh. Disable it.
  devIndicators: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
    minimumCacheTTL: 604800,
  },
};

module.exports = nextConfig;
