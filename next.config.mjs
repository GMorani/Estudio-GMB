/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Ignorar errores de ESLint durante la compilación
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignorar errores de TypeScript durante la compilación
    ignoreBuildErrors: true,
  },
  // Desactivar la optimización de imágenes para simplificar
  images: {
    unoptimized: true,
  },
}

export default nextConfig
