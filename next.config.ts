import type { NextConfig } from "next";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");
const javaApiBaseUrl = process.env.NEXT_PUBLIC_JAVA_API_BASE_URL?.replace(
  /\/+$/,
  "",
);

const nextConfig: NextConfig = {
  async rewrites() {
    const rules = [];

    if (apiBaseUrl) {
      rules.push({
        source: "/proxy/:path*",
        destination: `${apiBaseUrl}/:path*`,
      });
    }

    if (apiBaseUrl) {
      rules.push({
        source: "/vts-proxy/:path*",
        destination: `${apiBaseUrl}/:path*`,
      });
    }

    if (apiBaseUrl) {
      rules.push({
        source: "/live-tracking-proxy/:path*",
        destination: `${apiBaseUrl}/:path*`,
      });
    }

    if (javaApiBaseUrl) {
      rules.push({
        source: "/java-proxy/:path*",
        destination: `${javaApiBaseUrl}/:path*`,
      });
    }

    return rules;
  },
};

export default nextConfig;
