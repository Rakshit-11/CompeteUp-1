/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['utfs.io'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: ''
      }
    ]
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'competeup.vercel.app']
    }
  },
  webpack: (config) => {
    config.externals = [...config.externals, 'mongoose'];
    return config;
  }
}

module.exports = nextConfig
