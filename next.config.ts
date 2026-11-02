import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['firebase-admin', 'nodemailer'],
  poweredByHeader: false,
  turbopack: {
    root: __dirname,
  },
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
};

export default nextConfig;
