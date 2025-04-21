"use client"

import { useState } from "react"
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("recientes")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido al sistema de gestión de Estudio GMB</p>
      </div>

      <DashboardTabs />
    </div>
  )
}
