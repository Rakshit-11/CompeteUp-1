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
  webpack: (config, { isServer }) => {
    // Prevent server-only modules from being bundled on the client side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        dns: false,
        net: false,
        tls: false,
        'mongodb-client-encryption': false,
        'aws4': false,
        'supports-color': false,
        'mongodb': false,
        'mongoose': false
      }
    }
    return config
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'competeup.vercel.app']
    }
  },
  // Optimize for production
  swcMinify: true,
  poweredByHeader: false,
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  }
}

module.exports = nextConfig
