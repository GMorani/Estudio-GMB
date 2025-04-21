"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

export function DashboardCharts() {
  const [expedientesData, setExpedientesData] = useState([])
  const [tareasData, setTareasData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const supabase = createClientComponentClient()

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Obtener datos de expedientes por estado
        const { data: expedientesRaw, error: expedientesError } = await supabase.from("expedientes").select("estado")

        if (expedientesError) throw expedientesError

        // Contar expedientes por estado
        const expedientesPorEstado = {}
        expedientesRaw.forEach((exp) => {
          const estado = exp.estado || "No especificado"
          expedientesPorEstado[estado] = (expedientesPorEstado[estado] || 0) + 1
        })

        // Convertir a formato para gráfico
        const expedientesDataFormatted = Object.entries(expedientesPorEstado).map(([estado, cantidad]) => ({
          name: estado,
          value: cantidad,
        }))

        setExpedientesData(expedientesDataFormatted)

        // Obtener datos de tareas por estado
        const { data: tareasRaw, error: tareasError } = await supabase.from("tareas").select("estado")

        if (tareasError) throw tareasError

        // Contar tareas por estado
        const tareasPorEstado = {}
        tareasRaw.forEach((tarea) => {
          const estado = tarea.estado || "No especificado"
          tareasPorEstado[estado] = (tareasPorEstado[estado] || 0) + 1
        })

        // Convertir a formato para gráfico
        const tareasDataFormatted = Object.entries(tareasPorEstado).map(([estado, cantidad]) => ({
          name: estado,
          value: cantidad,
        }))

        setTareasData(tareasDataFormatted)
      } catch (error) {
        console.error("Error fetching chart data:", error.message)
        setError(`Error fetching chart data: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Expedientes por Estado</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            </div>
          ) : expedientesData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expedientesData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expedientesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">No hay datos para mostrar.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tareas por Estado</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            </div>
          ) : tareasData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tareasData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {tareasData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">No hay datos para mostrar.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
