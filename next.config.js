/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["source.unsplash.com", "airlineimages.s3.ap-southeast-1.amazonaws.com", "localhost"],
  },
};

module.exports = nextConfig;
