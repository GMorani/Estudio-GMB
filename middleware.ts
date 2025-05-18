import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const { pathname } = url

  // Redirigir /clientes/nuevo a la página correcta
  if (pathname === "/clientes/nuevo") {
    url.pathname = "/clientes/nuevo"
    return NextResponse.rewrite(url)
  }

  // Redirigir /expedientes/nuevo a la página correcta
  if (pathname === "/expedientes/nuevo") {
    url.pathname = "/expedientes/nuevo"
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}
