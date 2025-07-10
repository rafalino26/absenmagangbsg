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
      // NANTI, saat sudah pakai Supabase, tambahkan konfigurasinya di sini
      // {
      //   protocol: 'https',
      //   hostname: 'xyzabc.supabase.co', // Ganti dengan URL Supabase Storage kamu
      //   port: '',
      //   pathname: '/**',
      // }
    ],
  },
};

export default nextConfig;