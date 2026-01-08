/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Disable ESLint during build for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ||
      "https://ichhadhari-backend-162541991773.asia-south1.run.app",
  },

  // Transpile workspace packages
  transpilePackages: ["@ichhadhari/shared"],

  // Image configuration
  images: {
    domains: [
      "ichhadhari-backend-2ljhubczcq-el.a.run.app",
      "ichhadhari-backend-162541991773.asia-south1.run.app"
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ichhadhari-backend-2ljhubczcq-el.a.run.app",
      },
      {
        protocol: "https",
        hostname: "ichhadhari-backend-162541991773.asia-south1.run.app",
      },
    ],
  },
};

module.exports = nextConfig;
