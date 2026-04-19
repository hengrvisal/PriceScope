/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverComponentsExternalPackages: ["@prisma/client", "ioredis", "bullmq"] },
};
module.exports = nextConfig;
