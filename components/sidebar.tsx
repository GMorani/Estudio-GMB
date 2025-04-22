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

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      color: "text-sky-500",
    },
    {
      label: "Expedientes",
      icon: FileText,
      href: "/expedientes",
      color: "text-violet-500",
    },
    {
      label: "Tareas",
      icon: CheckSquare,
      href: "/tareas",
      color: "text-pink-500",
    },
    {
      label: "Personas",
      icon: Users,
      href: "/personas",
      color: "text-orange-500",
    },
    {
      label: "Clientes",
      icon: UserRound,
      href: "/clientes",
      color: "text-emerald-500",
    },
    {
      label: "Abogados",
      icon: Briefcase,
      href: "/abogados",
      color: "text-blue-500",
    },
    {
      label: "Aseguradoras",
      icon: Building2,
      href: "/aseguradoras",
      color: "text-red-500",
    },
    {
      label: "Juzgados",
      icon: Scale,
      href: "/juzgados",
      color: "text-yellow-500",
    },
    {
      label: "Calendario",
      icon: Calendar,
      href: "/calendario",
      color: "text-green-500",
    },
    {
      label: "Configuración",
      icon: Settings,
      href: "/configuracion",
      color: "text-gray-500",
    },
  ]

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Estudio GMB</h2>
          <div className="space-y-1">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant={pathname === route.href ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link href={route.href} prefetch={true}>
                  <route.icon className={cn("mr-2 h-4 w-4", route.color)} />
                  {route.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
