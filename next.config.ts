import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', // Increased from default 1mb to handle large presentations
    },
  },
  
  // Also configure API routes body size limit
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Allow even larger payloads for API routes
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ucarecdn.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehimg.com',
        port: '',
        pathname: '/**',
      },
      // {
      //   protocol: 'https', 
      //   hostname: '',  host name will have to do with the image generation service WIP
      //   port: '',
      //   pathname: '/**',
      // },
    ],
  },
};

export default nextConfig;
