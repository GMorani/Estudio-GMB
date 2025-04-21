"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

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
import { Button } from "@/components/ui/button"

export const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      className={cn("flex h-full w-64 flex-col border-r bg-popover text-popover-foreground", className)}
      ref={ref}
      {...props}
    />
  ),
)
SidebarContent.displayName = "SidebarContent"

export const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div className={cn("flex items-center justify-between border-t p-4", className)} ref={ref} {...props} />
  ),
)
SidebarFooter.displayName = "SidebarFooter"

export const SidebarGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div className={cn("space-y-1", className)} ref={ref} {...props} />,
)
SidebarGroup.displayName = "SidebarGroup"

export const SidebarGroupAction = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:opacity-50 data-[state=open]:bg-secondary data-[state=open]:text-muted-foreground hover:bg-secondary hover:text-muted-foreground",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
)
SidebarGroupAction.displayName = "SidebarGroupAction"

export const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div className={cn("mt-2 space-y-1 pl-4", className)} ref={ref} {...props} />,
)
SidebarGroupContent.displayName = "SidebarGroupContent"

export const SidebarGroupLabel = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 className={cn("mb-2 px-4 text-sm font-semibold opacity-70", className)} ref={ref} {...props} />
  ),
)
SidebarGroupLabel.displayName = "SidebarGroupLabel"

export const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div className={cn("flex items-center justify-between px-4 py-2", className)} ref={ref} {...props} />
  ),
)
SidebarHeader.displayName = "SidebarHeader"

export const SidebarInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
)
SidebarInput.displayName = "SidebarInput"

export const SidebarInset = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div className={cn("p-4", className)} ref={ref} {...props} />,
)
SidebarInset.displayName = "SidebarInset"

export const SidebarMenu = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div className={cn("relative", className)} ref={ref} {...props} />,
)
SidebarMenu.displayName = "SidebarMenu"

export const SidebarMenuAction = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button
      className={cn(
        "group inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:opacity-50 data-[state=open]:bg-secondary data-[state=open]:text-muted-foreground hover:bg-secondary hover:text-muted-foreground",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
)
SidebarMenuAction.displayName = "SidebarMenuAction"

export const SidebarMenuBadge = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div className={cn("ml-auto px-2 py-0.5 text-xs font-semibold", className)} ref={ref} {...props} />
  ),
)
SidebarMenuBadge.displayName = "SidebarMenuBadge"

export const SidebarMenuButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button
      className={cn(
        "flex w-full cursor-pointer select-none items-center rounded-md px-3 py-1.5 text-sm font-medium outline-none focus:bg-secondary hover:bg-secondary",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
)
SidebarMenuButton.displayName = "SidebarMenuButton"

export const SidebarMenuItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div className={cn("flex items-center space-x-2 rounded-md p-2", className)} ref={ref} {...props} />
  ),
)
SidebarMenuItem.displayName = "SidebarMenuItem"

export const SidebarMenuSkeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div className={cn("h-7 w-[calc(100%-1rem)] rounded-md bg-secondary", className)} ref={ref} {...props} />
  ),
)
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton"

export const SidebarMenuSub = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div className={cn("mt-2 space-y-1 pl-8", className)} ref={ref} {...props} />,
)
SidebarMenuSub.displayName = "SidebarMenuSub"

export const SidebarMenuSubButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button
      className={cn(
        "flex w-full cursor-pointer select-none items-center rounded-md px-3 py-1.5 text-sm font-medium outline-none focus:bg-secondary hover:bg-secondary",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
)
SidebarMenuSubButton.displayName = "SidebarMenuSubButton"

export const SidebarMenuSubItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div className={cn("flex items-center space-x-2 rounded-md p-2", className)} ref={ref} {...props} />
  ),
)
SidebarMenuSubItem.displayName = "SidebarMenuSubItem"

export const SidebarProvider = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div className={cn("", className)} ref={ref} {...props} />,
)
SidebarProvider.displayName = "SidebarProvider"

export const SidebarRail = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div className={cn("hidden h-full p-2 md:block", className)} ref={ref} {...props} />
  ),
)
SidebarRail.displayName = "SidebarRail"

export const SidebarSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div className={cn("h-px w-full bg-border", className)} ref={ref} {...props} />,
)
SidebarSeparator.displayName = "SidebarSeparator"

export const SidebarTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:opacity-50 data-[state=open]:bg-secondary data-[state=open]:text-muted-foreground hover:bg-secondary hover:text-muted-foreground",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
)
SidebarTrigger.displayName = "SidebarTrigger"

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
                <Link href={route.href} prefetch={false}>
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
