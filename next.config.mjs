/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  devIndicators: false,
  // Improve dev server stability
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Disable webpack cache in development to prevent stale module issues
      config.cache = false;

      // Better error handling for missing modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }


    return config;
  },
  // Experimental features for better stability
  experimental: {
    forceSwcTransforms: false,
  },
  // Disable performance monitoring that's causing loops
  compiler: {
    removeConsole: false,
  },
  // Disable all development UI elements
  env: {
    NEXT_TELEMETRY_DISABLED: '1',
  },
  // Better error recovery
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

export default nextConfig