/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  experimental: {
    // Remove the optimizeCss option that's causing the error
    // optimizeCss: true,
  },
  // Configuración para limitar el número de solicitudes simultáneas
  httpAgentOptions: {
    keepAlive: true,
    maxSockets: 50, // Limitar el número de conexiones simultáneas
    maxFreeSockets: 10,
    timeout: 60000,
  },
}

export default nextConfig
