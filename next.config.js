/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@prisma/client", "ioredis", "bullmq"],
  turbopack: {
    root: __dirname,
  },
};
module.exports = nextConfig;
