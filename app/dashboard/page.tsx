import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ProximasTareas } from "@/components/dashboard/proximas-tareas"
import { RecentActivities } from "@/components/dashboard/recent-activities"
import { DashboardCharts } from "@/components/dashboard/dashboard-charts"
import { RecentClientes } from "@/components/dashboard/recent-clientes"

export const metadata = {
  title: "Dashboard",
  description: "Panel de control del sistema de gestión para despachos de abogados",
}

export default async function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Dashboard"
        text="Bienvenido al panel de control del sistema de gestión para despachos de abogados."
      />
      <Tabs defaultValue="actividad" className="space-y-4">
        <TabsList>
          <TabsTrigger value="actividad">Actividad Reciente</TabsTrigger>
          <TabsTrigger value="tareas">Tareas Pendientes</TabsTrigger>
          <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
          <TabsTrigger value="clientes">Clientes Recientes</TabsTrigger>
        </TabsList>
        <TabsContent value="actividad" className="space-y-4">
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <RecentActivities />
          </Suspense>
        </TabsContent>
        <TabsContent value="tareas" className="space-y-4">
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <ProximasTareas />
          </Suspense>
        </TabsContent>
        <TabsContent value="estadisticas" className="space-y-4">
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <DashboardCharts />
          </Suspense>
        </TabsContent>
        <TabsContent value="clientes" className="space-y-4">
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <RecentClientes />
          </Suspense>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
