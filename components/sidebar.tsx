"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  Briefcase,
  FileText,
  Home,
  Users,
  Building,
  Scale,
  Gavel,
  Microscope,
  ChevronDown,
  ChevronRight,
  Calendar,
  BarChart3,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export function Sidebar() {
  const pathname = usePathname()
  const [isPersonasOpen, setIsPersonasOpen] = useState(
    pathname.includes("/personas") ||
      pathname.includes("/clientes") ||
      pathname.includes("/aseguradoras") ||
      pathname.includes("/abogados") ||
      pathname.includes("/juzgados") ||
      pathname.includes("/mediadores") ||
      pathname.includes("/peritos"),
  )

  const mainRoutes = [
    {
      href: "/",
      icon: Home,
      title: "Inicio",
      color: "#3b82f6", // Azul
    },
    {
      href: "/expedientes",
      icon: FileText,
      title: "Expedientes",
      color: "#8b5cf6", // Morado
    },
    {
      href: "/calendario",
      icon: Calendar,
      title: "Calendario",
      color: "#f97316", // Naranja
    },
    {
      href: "/reportes",
      icon: BarChart3,
      title: "Reportes",
      color: "#10b981", // Verde
    },
    {
      href: "/configuracion",
      icon: Settings,
      title: "Configuración",
      color: "#6b7280", // Gris
    },
  ]

  const personasSubRoutes = [
    {
      href: "/personas",
      icon: Users,
      title: "Todas las Personas",
      color: "#ef4444", // Rojo
    },
    {
      href: "/clientes",
      icon: Users,
      title: "Clientes",
      color: "#ef4444", // Rojo
    },
    {
      href: "/aseguradoras",
      icon: Building,
      title: "Aseguradoras",
      color: "#ef4444", // Rojo
    },
    {
      href: "/abogados",
      icon: Briefcase,
      title: "Abogados",
      color: "#ef4444", // Rojo
    },
    {
      href: "/juzgados",
      icon: Scale,
      title: "Juzgados",
      color: "#ef4444", // Rojo
    },
    {
      href: "/mediadores",
      icon: Gavel,
      title: "Mediadores",
      color: "#ef4444", // Rojo
    },
    {
      href: "/peritos",
      icon: Microscope,
      title: "Peritos",
      color: "#ef4444", // Rojo
    },
  ]

  return (
    <TooltipProvider>
      <div className="flex h-full w-16 flex-col border-r bg-muted/40 md:w-64">
        <div className="flex h-16 items-center border-b px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Home className="h-6 w-6 text-blue-500" />
            <span className="hidden md:inline-flex">Estudio GMB</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 md:px-4 gap-1">
            {/* Rutas principales */}
            {mainRoutes.map((route) => {
              const Icon = route.icon
              return (
                <Tooltip key={route.href} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link
                      href={route.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                        pathname === route.href ? "bg-accent text-accent-foreground" : "transparent",
                      )}
                    >
                      <Icon className="h-5 w-5" style={{ color: route.color }} />
                      <span className="hidden md:inline-flex">{route.title}</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="md:hidden">
                    {route.title}
                  </TooltipContent>
                </Tooltip>
              )
            })}

            {/* Menú desplegable de Personas */}
            <Collapsible open={isPersonasOpen} onOpenChange={setIsPersonasOpen} className="w-full">
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <CollapsibleTrigger className="w-full">
                    <div
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                        personasSubRoutes.some((route) => pathname === route.href)
                          ? "bg-accent text-accent-foreground"
                          : "transparent",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5" style={{ color: "#ef4444" }} />
                        <span className="hidden md:inline-flex">Personas</span>
                      </div>
                      <div className="hidden md:block">
                        {isPersonasOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                </TooltipTrigger>
                <TooltipContent side="right" className="md:hidden">
                  Personas
                </TooltipContent>
              </Tooltip>

              <CollapsibleContent className="pl-2 md:pl-4 space-y-1 mt-1">
                {personasSubRoutes.map((route) => {
                  const Icon = route.icon
                  return (
                    <Tooltip key={route.href} delayDuration={0}>
                      <TooltipTrigger asChild>
                        <Link
                          href={route.href}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                            pathname === route.href ? "bg-accent text-accent-foreground" : "transparent",
                          )}
                        >
                          <Icon className="h-4 w-4" style={{ color: route.color }} />
                          <span className="hidden md:inline-flex">{route.title}</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="md:hidden">
                        {route.title}
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </CollapsibleContent>
            </Collapsible>
          </nav>
        </div>
      </div>
    </TooltipProvider>
  )
}
