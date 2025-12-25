/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // ✅ Cloudinary Allow kiya
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;
