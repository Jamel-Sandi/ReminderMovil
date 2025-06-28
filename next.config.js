// next.config.js - CONFIGURACIÓN PARA SUPABASE EN PRODUCCIÓN
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ TypeScript configuración
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // ✅ ESLint configuración
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // ✅ Paquetes externos del servidor
  serverExternalPackages: [
    'nodemailer', 
    '@supabase/supabase-js'
  ],
  
  // ✅ Configuración experimental
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ['@supabase/supabase-js', 'nodemailer']
  },
  
  // ✅ Headers CORS para todas las rutas API
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400',
          },
        ],
      },
    ];
  },
  
  // ✅ Variables de entorno para el cliente
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  
  // ✅ Configuración de Webpack para evitar errores
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    
    return config;
  },
  
  // ✅ Configuración de imágenes
  images: {
    domains: ['vgdjgvsnvqdpfofhtgwt.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vgdjgvsnvqdpfofhtgwt.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  
  // ✅ Configuración adicional para Vercel
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  
  // ✅ Configuración de output para Vercel
  output: 'standalone',
  
  // ✅ Configuración de compresión
  compress: true,
  
  // ✅ Configuración de PoweredByHeader
  poweredByHeader: false,
  
  // ✅ Configuración de redirects si es necesario
  async redirects() {
    return [];
  }
};

module.exports = nextConfig;