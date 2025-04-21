"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, BarChart2 } from "lucide-react"
import { RecentActivities } from "@/components/dashboard/recent-activities"
import { ProximasTareas } from "@/components/dashboard/proximas-tareas"
import { DashboardCharts } from "@/components/dashboard/dashboard-charts"

export function DashboardTabs() {
  const [activeTab, setActiveTab] = useState("recientes")

  return (
    <Tabs defaultValue="recientes" onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="recientes">
          <Clock className="mr-2 h-4 w-4" />
          Actividad Reciente
        </TabsTrigger>
        <TabsTrigger value="estadisticas">
          <BarChart2 className="mr-2 h-4 w-4" />
          Estadísticas
        </TabsTrigger>
      </TabsList>
      <TabsContent value="recientes" className="mt-4 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <RecentActivities />
          <ProximasTareas />
        </div>
      </TabsContent>
      <TabsContent value="estadisticas" className="mt-4">
        <DashboardCharts />
      </TabsContent>
    </Tabs>
  )
}
