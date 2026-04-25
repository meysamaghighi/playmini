import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false,
  async redirects() {
    return [
      { source: "/table-tennis", destination: "/pong", permanent: true },
    ];
  },
};

export default nextConfig;
