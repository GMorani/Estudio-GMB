"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecentActivities } from "@/components/dashboard/recent-activities"
import { ProximasTareas } from "@/components/dashboard/proximas-tareas"
import { DashboardCharts } from "@/components/dashboard/dashboard-charts"
import { RecentClientes } from "@/components/dashboard/recent-clientes"

export function DashboardTabs() {
  const [activeTab, setActiveTab] = useState("actividad")

  return (
    <Tabs defaultValue="actividad" className="w-full" onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-4 mb-8">
        <TabsTrigger value="actividad">Actividad Reciente</TabsTrigger>
        <TabsTrigger value="tareas">Tareas Pendientes</TabsTrigger>
        <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
        <TabsTrigger value="clientes">Clientes Recientes</TabsTrigger>
      </TabsList>

      <TabsContent value="actividad" className="space-y-4">
        <RecentActivities />
      </TabsContent>

      <TabsContent value="tareas" className="space-y-4">
        <ProximasTareas />
      </TabsContent>

      <TabsContent value="estadisticas" className="space-y-4">
        <DashboardCharts />
      </TabsContent>

      <TabsContent value="clientes" className="space-y-4">
        <RecentClientes />
      </TabsContent>
    </Tabs>
  )
}
