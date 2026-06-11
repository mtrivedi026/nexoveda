import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    console.log(`📡 Next.js API Proxy configured for: ${backendUrl}`);
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/socket.io/:path*',
        destination: `${backendUrl}/socket.io/:path*`,
      },
    ];
  }
};

export default nextConfig;
