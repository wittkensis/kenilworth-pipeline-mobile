import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  // Exclude better-sqlite3 from client bundle
  serverExternalPackages: ['better-sqlite3'],
};

export default nextConfig;
