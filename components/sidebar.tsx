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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname()

  // Definir los iconos como componentes separados para evitar problemas de JSX
  const DashboardIcon = LayoutDashboard
  const ExpedientesIcon = FileText
  const TareasIcon = CheckSquare
  const ClientesIcon = UserRound
  const AbogadosIcon = Briefcase
  const AseguradorasIcon = Building2
  const JuzgadosIcon = Scale
  const PeritosIcon = UserRound
  const MediadoresIcon = Users
  const CalendarioIcon = Calendar
  const ConfiguracionIcon = Settings

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
                <DashboardIcon className="mr-2 h-4 w-4 text-sky-500" />
                Dashboard
              </Link>
            </Button>

            <Button
              variant={pathname === "/expedientes" ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="/expedientes">
                <ExpedientesIcon className="mr-2 h-4 w-4 text-violet-500" />
                Expedientes
              </Link>
            </Button>

            <Button variant={pathname === "/tareas" ? "secondary" : "ghost"} className="w-full justify-start" asChild>
              <Link href="/tareas">
                <TareasIcon className="mr-2 h-4 w-4 text-pink-500" />
                Tareas
              </Link>
            </Button>

            <Button variant={pathname === "/clientes" ? "secondary" : "ghost"} className="w-full justify-start" asChild>
              <Link href="/clientes">
                <ClientesIcon className="mr-2 h-4 w-4 text-emerald-500" />
                Clientes
              </Link>
            </Button>

            <Button variant={pathname === "/abogados" ? "secondary" : "ghost"} className="w-full justify-start" asChild>
              <Link href="/abogados">
                <AbogadosIcon className="mr-2 h-4 w-4 text-blue-500" />
                Abogados
              </Link>
            </Button>

            <Button
              variant={pathname === "/aseguradoras" ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="/aseguradoras">
                <AseguradorasIcon className="mr-2 h-4 w-4 text-red-500" />
                Aseguradoras
              </Link>
            </Button>

            <Button variant={pathname === "/juzgados" ? "secondary" : "ghost"} className="w-full justify-start" asChild>
              <Link href="/juzgados">
                <JuzgadosIcon className="mr-2 h-4 w-4 text-yellow-500" />
                Juzgados
              </Link>
            </Button>

            <Button variant={pathname === "/peritos" ? "secondary" : "ghost"} className="w-full justify-start" asChild>
              <Link href="/peritos">
                <PeritosIcon className="mr-2 h-4 w-4 text-purple-500" />
                Peritos
              </Link>
            </Button>

            <Button
              variant={pathname === "/mediadores" ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="/mediadores">
                <MediadoresIcon className="mr-2 h-4 w-4 text-indigo-500" />
                Mediadores
              </Link>
            </Button>

            <Button
              variant={pathname === "/calendario" ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="/calendario">
                <CalendarioIcon className="mr-2 h-4 w-4 text-green-500" />
                Calendario
              </Link>
            </Button>

            <Button
              variant={pathname === "/configuracion" ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="/configuracion">
                <ConfiguracionIcon className="mr-2 h-4 w-4 text-gray-500" />
                Configuración
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
