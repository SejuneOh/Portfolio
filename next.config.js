/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'www.notion.so',
      'images.unsplash.com',
      's3.us-west-2.amzonaws.com',
      'avatars.githubusercontent.com'
    ]
  }
}

module.exports = nextConfig
