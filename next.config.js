/** @type {import('next').NextConfig} */

// Build allowed origins for Server Actions
const allowedOrigins = ['localhost:3000'];

// Add GitHub Codespaces origin if running in Codespaces
if (process.env.CODESPACE_NAME) {
  allowedOrigins.push(`${process.env.CODESPACE_NAME}-3000.app.github.dev`);
}

// Add any custom CODESPACES_HOST if provided
if (process.env.CODESPACES_HOST) {
  allowedOrigins.push(process.env.CODESPACES_HOST);
}

const nextConfig = {
  reactStrictMode: true,
  turbopack: {},

  // Fix Server Actions header mismatch in GitHub Codespaces
  experimental: {
    serverActions: {
      allowedOrigins: allowedOrigins,
    },
  },

  // Allow Cloudinary images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig;
