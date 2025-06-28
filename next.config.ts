/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Temporal para desarrollo
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporal para desarrollo
  },
  // Paquetes externos necesarios
  serverExternalPackages: [
    'mysql2',       // Para conexión directa con MySQL (si usas)
    'nodemailer',   // Para envío de emails
    'cron',         // Para tareas programadas
    '@supabase/supabase-js' // Cliente de Supabase
  ],
  // Otras configuraciones recomendadas
  experimental: {
    serverActions: true // Si usas Server Actions
  }
}

module.exports = nextConfig