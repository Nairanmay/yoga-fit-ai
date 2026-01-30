import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    '@tensorflow/tfjs-core',
    '@tensorflow/tfjs-converter',
    '@tensorflow/tfjs-backend-webgl',
    '@tensorflow-models/pose-detection',
    '@mediapipe/pose'
  ],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    return config;
  },
};

export default nextConfig;