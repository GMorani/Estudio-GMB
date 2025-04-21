import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Ya no redirigimos automáticamente desde la raíz
  // Solo manejamos otras rutas si es necesario

  return NextResponse.next()
}

// Configurar las rutas que activarán el middleware si es necesario
export const config = {
  matcher: [
    // Rutas que requieren autenticación, por ejemplo
    "/dashboard/:path*",
    "/expedientes/:path*",
    "/clientes/:path*",
    // etc.
  ],
}
