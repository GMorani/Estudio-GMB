"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Users, Building, Clock } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function DashboardStats() {
  const [stats, setStats] = useState({
    expedientes: 0,
    clientes: 0,
    aseguradoras: 0,
    tareasPendientes: 0,
  })
  const [loading, setLoading] = useState(true)

  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchStats() {
      try {
        // Contar expedientes
        const { count: expedientesCount } = await supabase
          .from("expedientes")
          .select("*", { count: "exact", head: true })

        // Contar clientes
        const { count: clientesCount } = await supabase
          .from("personas")
          .select("*", { count: "exact", head: true })
          .eq("tipo_id", 1) // Asumiendo que tipo_id 1 es para clientes

        // Contar aseguradoras
        const { count: aseguradorasCount } = await supabase
          .from("aseguradoras")
          .select("*", { count: "exact", head: true })

        // Contar tareas pendientes
        const { count: tareasCount } = await supabase
          .from("tareas_expediente")
          .select("*", { count: "exact", head: true })
          .eq("cumplida", false)

        setStats({
          expedientes: expedientesCount || 0,
          clientes: clientesCount || 0,
          aseguradoras: aseguradorasCount || 0,
          tareasPendientes: tareasCount || 0,
        })
      } catch (error) {
        console.error("Error al cargar estadísticas:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expedientes</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "..." : stats.expedientes}</div>
          <p className="text-xs text-muted-foreground">Total de expedientes activos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clientes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "..." : stats.clientes}</div>
          <p className="text-xs text-muted-foreground">Total de clientes registrados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aseguradoras</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "..." : stats.aseguradoras}</div>
          <p className="text-xs text-muted-foreground">Total de aseguradoras</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tareas Pendientes</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "..." : stats.tareasPendientes}</div>
          <p className="text-xs text-muted-foreground">Tareas sin completar</p>
        </CardContent>
      </Card>
    </div>
  )
}
