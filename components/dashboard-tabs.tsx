"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecentActivities } from "@/components/recent-activities"
import { ProximasTareas } from "@/components/proximas-tareas"
import { RecentClientes } from "@/components/recent-clientes"
import { DashboardCharts } from "@/components/dashboard-charts"
import { FileText, Clock, BarChart2, Users } from "lucide-react"

export function DashboardTabs() {
  const [activeTab, setActiveTab] = useState("actividad")

  return (
    <Tabs defaultValue="actividad" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-6">
        <TabsTrigger value="actividad" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>Actividad Reciente</span>
        </TabsTrigger>
        <TabsTrigger value="tareas" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>Tareas Pendientes</span>
        </TabsTrigger>
        <TabsTrigger value="estadisticas" className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4" />
          <span>Estadísticas</span>
        </TabsTrigger>
        <TabsTrigger value="clientes" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>Clientes Recientes</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="actividad" className="mt-0">
        <RecentActivities />
      </TabsContent>

      <TabsContent value="tareas" className="mt-0">
        <ProximasTareas />
      </TabsContent>

      <TabsContent value="estadisticas" className="mt-0">
        <DashboardCharts />
      </TabsContent>

      <TabsContent value="clientes" className="mt-0">
        <RecentClientes />
      </TabsContent>
    </Tabs>
  )
}
