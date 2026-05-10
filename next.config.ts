import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-slot',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-accordion',
      '@radix-ui/react-tabs',
    ],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [1, 75],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ywfnbkezdbcfbwwvwonn.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'mkclindia.wordpress.com',
      },
      {
        protocol: 'https',
        hostname: 'www.mkcl.org',
      },
      {
        protocol: 'https',
        hostname: 'mkcl.org',
      },
      {
         protocol: 'https',
         hostname: '**',
       },
     ],
  },
  async headers() {
    return [
      {
        source: '/:path((?:logo-|course-).*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, immutable' },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, immutable' },
        ],
      },
      {
        source: '/chatbot-avatar.png',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
