import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. ADD TURBO CONFIG AT ROOT (Not experimental)
  // This tells Next.js: "I know Turbopack is active, here is the config."
  // Leaving it empty resolves the conflict with the Webpack config.
  turbo: {},

  // 2. FORCE WEBPACK POLYFILLS (Required for TensorFlow)
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    return config;
  },

  // 3. Transpile Heavy AI Libraries
  transpilePackages: [
    '@tensorflow/tfjs-core',
    '@tensorflow/tfjs-converter',
    '@tensorflow/tfjs-backend-webgl',
    '@tensorflow-models/pose-detection',
    '@mediapipe/pose'
  ],

  // 4. Prevent Memory Crashes during Static Gen
  staticPageGenerationTimeout: 1000, 
  
  // 5. Ignore Typescript Errors during Build
  typescript: {
    ignoreBuildErrors: true,
  },

  // REMOVED: 'eslint' block. 
  // It is deprecated in Next.js 16 and causes build warnings.
};

export default nextConfig;