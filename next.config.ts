import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // PWA will be added via next-pwa wrapper
  // To enable: wrap with withPWA from next-pwa
};

export default nextConfig;
