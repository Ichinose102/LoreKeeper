import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Serverless functions pour les API routes
  experimental: {
    serverComponents: true,
  },
  // Configuration pour Vercel
  output: 'standalone',
  // Images optimisées
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
