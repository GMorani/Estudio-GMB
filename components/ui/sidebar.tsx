"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

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

export const Sidebar = () => {
  const [expandedGroup, setExpandedGroup] = React.useState<string | null>(null)

  const toggleGroup = (group: string) => {
    setExpandedGroup(expandedGroup === group ? null : group)
  }

  return (
    <SidebarContent>
      <SidebarHeader>
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
            G
          </div>
          <span className="text-lg font-bold">Estudio GMB</span>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <div className="flex-1 overflow-auto py-2">
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenuItem>
              <a
                href="/dashboard"
                className="flex items-center w-full px-2 py-1.5 text-sm rounded-md hover:bg-secondary"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <rect width="7" height="9" x="3" y="3" rx="1" />
                  <rect width="7" height="5" x="14" y="3" rx="1" />
                  <rect width="7" height="9" x="14" y="12" rx="1" />
                  <rect width="7" height="5" x="3" y="16" rx="1" />
                </svg>
                Dashboard
              </a>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <a
                href="/expedientes"
                className="flex items-center w-full px-2 py-1.5 text-sm rounded-md hover:bg-secondary"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                Expedientes
              </a>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <a
                href="/calendario"
                className="flex items-center w-full px-2 py-1.5 text-sm rounded-md hover:bg-secondary"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" x2="16" y1="2" y2="6" />
                  <line x1="8" x2="8" y1="2" y2="6" />
                  <line x1="3" x2="21" y1="10" y2="10" />
                </svg>
                Calendario
              </a>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <div
                onClick={() => toggleGroup("personas")}
                className="flex items-center w-full px-2 py-1.5 text-sm rounded-md hover:bg-secondary cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-4-4h-4" />
                  <path d="M16 3v4" />
                  <path d="M14 5h4" />
                </svg>
                Personas
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`ml-auto transition-transform duration-200 ${expandedGroup === "personas" ? "rotate-180" : ""}`}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </SidebarMenuItem>
            {expandedGroup === "personas" && (
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <a
                    href="/clientes"
                    className="flex items-center w-full px-2 py-1.5 text-sm rounded-md hover:bg-secondary"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    Clientes
                  </a>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <a
                    href="/abogados"
                    className="flex items-center w-full px-2 py-1.5 text-sm rounded-md hover:bg-secondary"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                    </svg>
                    Abogados
                  </a>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <a
                    href="/aseguradoras"
                    className="flex items-center w-full px-2 py-1.5 text-sm rounded-md hover:bg-secondary"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                      <path d="M13 5v2" />
                      <path d="M13 17v2" />
                      <path d="M13 11v2" />
                    </svg>
                    Aseguradoras
                  </a>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <a
                    href="/juzgados"
                    className="flex items-center w-full px-2 py-1.5 text-sm rounded-md hover:bg-secondary"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M7 7h.01" />
                      <path d="M12 7h.01" />
                      <path d="M17 7h.01" />
                      <path d="M7 12h.01" />
                      <path d="M12 12h.01" />
                      <path d="M17 12h.01" />
                      <path d="M7 17h.01" />
                      <path d="M12 17h.01" />
                      <path d="M17 17h.01" />
                    </svg>
                    Juzgados
                  </a>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <a
                    href="/mediadores"
                    className="flex items-center w-full px-2 py-1.5 text-sm rounded-md hover:bg-secondary"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h1" />
                      <path d="M16 3h1a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1" />
                      <path d="M12 12v3" />
                      <path d="M8 21v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <path d="M12 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
                    </svg>
                    Mediadores
                  </a>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <a
                    href="/peritos"
                    className="flex items-center w-full px-2 py-1.5 text-sm rounded-md hover:bg-secondary"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                    Peritos
                  </a>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <a
                    href="/personas"
                    className="flex items-center w-full px-2 py-1.5 text-sm rounded-md hover:bg-secondary"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-4-4h-4" />
                      <path d="M16 3v4" />
                      <path d="M14 5h4" />
                    </svg>
                    Todas las Personas
                  </a>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator className="my-2" />
        <SidebarGroup>
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenuItem>
              <a
                href="/configuracion"
                className="flex items-center w-full px-2 py-1.5 text-sm rounded-md hover:bg-secondary"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Configuración
              </a>
            </SidebarMenuItem>
          </SidebarGroupContent>
        </SidebarGroup>
      </div>
      <SidebarFooter>
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium">Usuario</p>
            <p className="text-xs text-muted-foreground">Administrador</p>
          </div>
        </div>
      </SidebarFooter>
    </SidebarContent>
  )
}
