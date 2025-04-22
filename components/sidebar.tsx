"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Settings,
  Building2,
  Scale,
  UserRound,
  Briefcase,
  CheckSquare,
  Search,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname()

  // Definir los elementos de navegación directamente sin usar un array
  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Estudio GMB</h2>
          <div className="space-y-1">
            {/* Dashboard */}
            <Button
              variant={pathname === "/dashboard" ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4 text-sky-500" />
                Dashboard
              </Link>
            </Button>

            {/* Expedientes */}
            <Button
              variant={pathname === "/expedientes" ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="/expedientes">
                <FileText className="mr-2 h-4 w-4 text-violet-500" />
                Expedientes
              </Link>
            </Button>

            {/* Tareas */}
            <Button variant={pathname === "/tareas" ? "secondary" : "ghost"} className="w-full justify-start" asChild>
              <Link href="/tareas">
                <CheckSquare className="mr-2 h-4 w-4 text-pink-500" />
                Tareas
              </Link>
            </Button>

            {/* Clientes */}
            <Button variant={pathname === "/clientes" ? "secondary" : "ghost"} className="w-full justify-start" asChild>
              <Link href="/clientes">
                <UserRound className="mr-2 h-4 w-4 text-emerald-500" />
                Clientes
              </Link>
            </Button>

            {/* Abogados */}
            <Button variant={pathname === "/abogados" ? "secondary" : "ghost"} className="w-full justify-start" asChild>
              <Link href="/abogados">
                <Briefcase className="mr-2 h-4 w-4 text-blue-500" />
                Abogados
              </Link>
            </Button>

            {/* Aseguradoras */}
            <Button
              variant={pathname === "/aseguradoras" ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="/aseguradoras">
                <Building2 className="mr-2 h-4 w-4 text-red-500" />
                Aseguradoras
              </Link>
            </Button>

            {/* Juzgados */}
            <Button variant={pathname === "/juzgados" ? "secondary" : "ghost"} className="w-full justify-start" asChild>
              <Link href="/juzgados">
                <Scale className="mr-2 h-4 w-4 text-yellow-500" />
                Juzgados
              </Link>
            </Button>

            {/* Peritos */}
            <Button variant={pathname === "/peritos" ? "secondary" : "ghost"} className="w-full justify-start" asChild>
              <Link href="/peritos">
                <Search className="mr-2 h-4 w-4 text-purple-500" />
                Peritos
              </Link>
            </Button>

            {/* Mediadores */}
            <Button
              variant={pathname === "/mediadores" ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="/mediadores">
                <Users className="mr-2 h-4 w-4 text-indigo-500" />
                Mediadores
              </Link>
            </Button>

            {/* Calendario */}
            <Button
              variant={pathname === "/calendario" ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="/calendario">
                <Calendar className="mr-2 h-4 w-4 text-green-500" />
                Calendario
              </Link>
            </Button>

            {/* Configuración */}
            <Button
              variant={pathname === "/configuracion" ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="/configuracion">
                <Settings className="mr-2 h-4 w-4 text-gray-500" />
                Configuración
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
