import type React from "react"
interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="container mx-auto py-6">
      <div className="grid gap-6">{children}</div>
    </div>
  )
}
