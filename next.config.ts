import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc', // Izinkan domain untuk mock data kita
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'modypesdyaocdnijnwtn.supabase.co', // Ganti dengan hostname Supabase-mu
      },
    ],
  },
};

export default nextConfig;