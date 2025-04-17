"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface NavItemProps {
  href: string
  title: string
  icon: React.ReactNode
  isCollapsed: boolean
}

export function NavItem({ href, title, icon, isCollapsed }: NavItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
        isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
        isCollapsed ? "justify-center" : "",
      )}
    >
      {icon}
      {!isCollapsed && <span>{title}</span>}
    </Link>
  )
}
