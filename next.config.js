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
  webpack: (config) => {
    // Prevent mongoose from being bundled on the client side
    if (!config.isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        mongoose: false,
      };
    }
    return config;
  }
}

module.exports = nextConfig
