import { DashboardStats } from "@/components/dashboard-stats"
import { RecentExpedientes } from "@/components/recent-expedientes"
import { ProximasTareas } from "@/components/proximas-tareas"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <DashboardStats />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Expedientes Recientes</CardTitle>
            <CardDescription>Últimos expedientes creados o actualizados</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentExpedientes />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximas Tareas</CardTitle>
            <CardDescription>Tareas pendientes con vencimiento próximo</CardDescription>
          </CardHeader>
          <CardContent>
            <ProximasTareas />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
