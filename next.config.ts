/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ['mysql2', 'nodemailer', 'cron', '@supabase/supabase-js'],
  experimental: {
    serverActions: true
  }
}

module.exports = nextConfig