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
      "https://ichhadhari-backend-2ljhubczcq-el.a.run.app/api",
  },

  // Transpile workspace packages
  transpilePackages: ["@ichhadhari/shared"],

  // Image configuration
  images: {
    domains: ["ichhadhari-backend-2ljhubczcq-el.a.run.app"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ichhadhari-backend-2ljhubczcq-el.a.run.app",
      },
    ],
  },
};

module.exports = nextConfig;
