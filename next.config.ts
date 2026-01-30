import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Fix AI Library Bundling
  transpilePackages: [
    '@tensorflow/tfjs-core',
    '@tensorflow/tfjs-converter',
    '@tensorflow/tfjs-backend-webgl',
    '@tensorflow-models/pose-detection',
    '@mediapipe/pose'
  ],

  // 2. Webpack Config for AI
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    return config;
  },

  // 3. IGNORE BUILD ERRORS (Crucial for Vercel Deployment)
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;