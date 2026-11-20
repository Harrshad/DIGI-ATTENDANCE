/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@triattendance/shared'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
