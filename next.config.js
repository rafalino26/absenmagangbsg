/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'modypesdyaocdnijnwtn.supabase.co', // Pastikan ini hostname Supabase Anda
      },
    ],
  },
};

module.exports = nextConfig;