"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

export function DashboardCharts() {
  const [expedientesPorMes, setExpedientesPorMes] = useState<any[]>([])
  const [expedientesPorEstado, setExpedientesPorEstado] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchEstadisticas() {
      try {
        // Simulamos datos para el gráfico de expedientes por mes
        // En una implementación real, esto vendría de una consulta a Supabase
        const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
        const datosPorMes = meses.map((mes) => ({
          name: mes,
          expedientes: Math.floor(Math.random() * 10),
        }))
        setExpedientesPorMes(datosPorMes)

        // Obtener estados de expedientes
        const { data: estados, error: estadosError } = await supabase
          .from("estados_expediente")
          .select("id, nombre, color")
          .order("nombre")

        if (estadosError) {
          console.error("Error al obtener estados:", estadosError)
          setExpedientesPorEstado([])
        } else if (estados) {
          // Para cada estado, contar cuántos expedientes lo tienen
          try {
            const conteos = await Promise.all(
              estados.map(async (estado) => {
                const { count, error: countError } = await supabase
                  .from("expediente_estados")
                  .select("*", { count: "exact", head: true })
                  .eq("estado_id", estado.id)

                if (countError) throw countError

                return {
                  name: estado.nombre,
                  value: count || 0,
                  color: estado.color,
                }
              }),
            )

            setExpedientesPorEstado(conteos.filter((item) => item.value > 0))
          } catch (countError) {
            console.error("Error al contar expedientes por estado:", countError)
            setExpedientesPorEstado([])
          }
        }
      } catch (error) {
        console.error("Error al cargar estadísticas:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEstadisticas()
  }, [supabase])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Expedientes por Mes</CardTitle>
            <CardDescription>Cantidad de expedientes creados por mes</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <Skeleton className="h-full w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Expedientes por Estado</CardTitle>
            <CardDescription>Distribución de expedientes según su estado</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <Skeleton className="h-full w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Expedientes por Mes</CardTitle>
          <CardDescription>Cantidad de expedientes creados por mes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={expedientesPorMes}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="expedientes" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expedientes por Estado</CardTitle>
          <CardDescription>Distribución de expedientes según su estado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {expedientesPorEstado.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">No hay datos disponibles</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expedientesPorEstado}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expedientesPorEstado.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
