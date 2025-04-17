"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  Briefcase,
  FileText,
  Home,
  LayoutDashboard,
  Users,
  Building,
  Scale,
  Gavel,
  UserCheck,
  Microscope,
  ChevronDown,
  ChevronRight,
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
      icon: LayoutDashboard,
      title: "Dashboard",
    },
    {
      href: "/expedientes",
      icon: FileText,
      title: "Expedientes",
    },
  ]

  const personasSubRoutes = [
    {
      href: "/personas",
      icon: Users,
      title: "Todas las Personas",
    },
    {
      href: "/clientes",
      icon: UserCheck,
      title: "Clientes",
    },
    {
      href: "/aseguradoras",
      icon: Building,
      title: "Aseguradoras",
    },
    {
      href: "/abogados",
      icon: Briefcase,
      title: "Abogados",
    },
    {
      href: "/juzgados",
      icon: Scale,
      title: "Juzgados",
    },
    {
      href: "/mediadores",
      icon: Gavel,
      title: "Mediadores",
    },
    {
      href: "/peritos",
      icon: Microscope,
      title: "Peritos",
    },
  ]

  return (
    <TooltipProvider>
      <div className="flex h-full w-16 flex-col border-r bg-muted/40 md:w-64">
        <div className="flex h-16 items-center border-b px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Home className="h-6 w-6" />
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
                      <Icon className="h-5 w-5" />
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
                        <Users className="h-5 w-5" />
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
                          <Icon className="h-4 w-4" />
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
