/** @type {import('next').NextConfig} */
const nextConfig = {
    trailingSlash: true,
    // We specify this here because Next.js handles trailing slashes much more reliably than custom Express middleware
}

module.exports = nextConfig
