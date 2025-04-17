"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Users, Clock, AlertCircle } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function DashboardStats() {
  const [stats, setStats] = useState({
    expedientes: 0,
    expedientesNuevos: 0,
    clientes: 0,
    clientesNuevos: 0,
    tareasPendientes: 0,
    tareasVencenHoy: 0,
    expedientesUrgentes: 0,
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

        // Contar expedientes nuevos (último mes)
        const unMesAtras = new Date()
        unMesAtras.setMonth(unMesAtras.getMonth() - 1)
        const { count: expedientesNuevosCount } = await supabase
          .from("expedientes")
          .select("*", { count: "exact", head: true })
          .gte("fecha_creacion", unMesAtras.toISOString())

        // Contar clientes
        const { count: clientesCount } = await supabase
          .from("personas")
          .select("*", { count: "exact", head: true })
          .eq("tipo_id", 1) // Asumiendo que tipo_id 1 es para clientes

        // Contar clientes nuevos (último mes)
        const { count: clientesNuevosCount } = await supabase
          .from("personas")
          .select("*", { count: "exact", head: true })
          .eq("tipo_id", 1)
          .gte("created_at", unMesAtras.toISOString())

        // Contar tareas pendientes
        const { count: tareasCount } = await supabase
          .from("tareas_expediente")
          .select("*", { count: "exact", head: true })
          .eq("cumplida", false)

        // Contar tareas que vencen hoy
        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)
        const manana = new Date(hoy)
        manana.setDate(manana.getDate() + 1)

        const { count: tareasHoyCount } = await supabase
          .from("tareas_expediente")
          .select("*", { count: "exact", head: true })
          .eq("cumplida", false)
          .gte("fecha_vencimiento", hoy.toISOString())
          .lt("fecha_vencimiento", manana.toISOString())

        // Contar expedientes urgentes (con estado urgente)
        const { count: expedientesUrgentesCount } = await supabase
          .from("expediente_estados")
          .select("*", { count: "exact", head: true })
          .eq("estado_id", 1) // Asumiendo que estado_id 1 es para urgentes

        setStats({
          expedientes: expedientesCount || 0,
          expedientesNuevos: expedientesNuevosCount || 0,
          clientes: clientesCount || 0,
          clientesNuevos: clientesNuevosCount || 0,
          tareasPendientes: tareasCount || 0,
          tareasVencenHoy: tareasHoyCount || 0,
          expedientesUrgentes: expedientesUrgentesCount || 0,
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
      {/* Expedientes Activos */}
      <Card className="overflow-hidden border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expedientes Activos</CardTitle>
          <FileText className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "..." : stats.expedientes}</div>
          <p className="text-xs text-green-600">+{loading ? "..." : stats.expedientesNuevos} en el último mes</p>
        </CardContent>
      </Card>

      {/* Clientes */}
      <Card className="overflow-hidden border-l-4 border-l-pink-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clientes</CardTitle>
          <Users className="h-4 w-4 text-pink-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "..." : stats.clientes}</div>
          <p className="text-xs text-green-600">+{loading ? "..." : stats.clientesNuevos} en el último mes</p>
        </CardContent>
      </Card>

      {/* Tareas Pendientes */}
      <Card className="overflow-hidden border-l-4 border-l-orange-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tareas Pendientes</CardTitle>
          <Clock className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "..." : stats.tareasPendientes}</div>
          <p className="text-xs text-orange-500">{loading ? "..." : stats.tareasVencenHoy} vencen hoy</p>
        </CardContent>
      </Card>

      {/* Expedientes Urgentes */}
      <Card className="overflow-hidden border-l-4 border-l-red-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expedientes Urgentes</CardTitle>
          <AlertCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "..." : stats.expedientesUrgentes}</div>
          <p className="text-xs text-red-500">Requieren atención inmediata</p>
        </CardContent>
      </Card>
    </div>
  )
}
