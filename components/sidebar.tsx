"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

export function Sidebar() {
  const pathname = usePathname()

  const routes = [
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
    {
      href: "/personas",
      icon: Users,
      title: "Personas",
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
            {routes.map((route) => {
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
          </nav>
        </div>
      </div>
    </TooltipProvider>
  )
}
