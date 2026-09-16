import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  experimental: {
    serverActions: {
      // Post forms may include rich HTML and an optional featured image upload.
      // Keep this above the 10MB image validation limit plus multipart overhead.
      bodySizeLimit: "12mb",
    },
  },
  webpack(config) {
    config.ignoreWarnings = [
      ...(config.ignoreWarnings ?? []),
      { module: /[\\/]node_modules[\\/]bullmq[\\/]/, message: /Critical dependency/ },
    ];
    config.resolve.alias = { ...(config.resolve.alias ?? {}), "@valkey/valkey-glide": false };
    return config;
  },
  output: process.env.DOCKER_BUILD === "true" ? "standalone" : undefined,
  images: {
    formats: ["image/avif", "image/webp"],
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async headers() {
    const adminPrefix = "/" + (process.env.ADMIN_PATH_SECRET?.trim().replace(/^\/+|\/+$/g, "") || "control-room");
    return [{
      source: `${adminPrefix}/:path*`,
      headers: [
        { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "no-referrer" },
      ],
    }, {
      source: "/api/:path*",
      headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
    }];
  },
  async redirects() {
    const adminPrefix = "/" + (process.env.ADMIN_PATH_SECRET?.trim().replace(/^\/+|\/+$/g, "") || "control-room");
    return [
      { source: "/investing/top-index-funds", destination: "/investing/best-index-funds", permanent: true },
      { source: "/admin", destination: `${adminPrefix}/`, permanent: false },
      { source: "/admin/:path*", destination: `${adminPrefix}/:path*`, permanent: false },
      { source: "/api/admin", destination: `${adminPrefix}/api/`, permanent: false },
      { source: "/api/admin/:path*", destination: `${adminPrefix}/api/:path*`, permanent: false },
    ];
  },
  async rewrites() {
    const adminPrefix = "/" + (process.env.ADMIN_PATH_SECRET?.trim().replace(/^\/+|\/+$/g, "") || "control-room");
    return [
      { source: `${adminPrefix}/api/:path*`, destination: "/api/admin/:path*" },
      { source: `${adminPrefix}/:path*`, destination: "/admin/:path*" },
    ];
  },
};

export default nextConfig;
