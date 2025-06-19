/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Ensure TypeScript paths are properly resolved
  experimental: {
    esmExternals: 'loose',
  },
  // Configure Supabase environment variables
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_BUCKET_NAME: process.env.SUPABASE_BUCKET_NAME || 'sites',
    SUPABASE_REGION: process.env.SUPABASE_REGION || 'eu-west-2',
    SUPABASE_STORAGE_URL: process.env.SUPABASE_STORAGE_URL,
  },
}

module.exports = nextConfig
