import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['web-push'],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
