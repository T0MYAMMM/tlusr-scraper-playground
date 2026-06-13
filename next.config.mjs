/** @type {import('next').NextConfig} */
const nextConfig = {
  // DATA_DIR env var overrides the default ../data path when running outside the repo root.
  env: {
    DATA_DIR: process.env.DATA_DIR ?? '',
    CONFIGS_DIR: process.env.CONFIGS_DIR ?? '',
  },
};

export default nextConfig;
