"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Navigation({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Estudio GMB</h2>
          <div className="space-y-1">
            <Button
              variant={pathname === "/dashboard" ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="/dashboard">
                <span className="mr-2">📊</span>
                Dashboard
              </Link>
            </Button>

            <Button
              variant={pathname === "/expedientes" ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="/expedientes">
                <span className="mr-2">📄</span>
                Expedientes
              </Link>
            </Button>

            <Button variant={pathname === "/tareas" ? "secondary" : "ghost"} className="w-full justify-start" asChild>
              <Link href="/tareas">
                <span className="mr-2">✓</span>
                Tareas
              </Link>
            </Button>

            <Button variant={pathname === "/clientes" ? "secondary" : "ghost"} className="w-full justify-start" asChild>
              <Link href="/clientes">
                <span className="mr-2">👤</span>
                Clientes
              </Link>
            </Button>

            <Button variant={pathname === "/abogados" ? "secondary" : "ghost"} className="w-full justify-start" asChild>
              <Link href="/abogados">
                <span className="mr-2">💼</span>
                Abogados
              </Link>
            </Button>

            <Button
              variant={pathname === "/aseguradoras" ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="/aseguradoras">
                <span className="mr-2">🏢</span>
                Aseguradoras
              </Link>
            </Button>

            <Button variant={pathname === "/juzgados" ? "secondary" : "ghost"} className="w-full justify-start" asChild>
              <Link href="/juzgados">
                <span className="mr-2">⚖️</span>
                Juzgados
              </Link>
            </Button>

            <Button variant={pathname === "/peritos" ? "secondary" : "ghost"} className="w-full justify-start" asChild>
              <Link href="/peritos">
                <span className="mr-2">🔍</span>
                Peritos
              </Link>
            </Button>

            <Button
              variant={pathname === "/mediadores" ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="/mediadores">
                <span className="mr-2">👥</span>
                Mediadores
              </Link>
            </Button>

            <Button
              variant={pathname === "/calendario" ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="/calendario">
                <span className="mr-2">📅</span>
                Calendario
              </Link>
            </Button>

            <Button
              variant={pathname === "/configuracion" ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="/configuracion">
                <span className="mr-2">⚙️</span>
                Configuración
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
