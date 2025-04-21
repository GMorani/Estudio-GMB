"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

export function DashboardCharts() {
  const [expedientesData, setExpedientesData] = useState([])
  const [tareasData, setTareasData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expedientesTableExists, setExpedientesTableExists] = useState(true)
  const [tareasTableExists, setTareasTableExists] = useState(true)
  const supabase = createClientComponentClient()

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#FF6B6B"]

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Verificar si la tabla expedientes existe
        const { error: expedientesTableCheckError } = await supabase.from("expedientes").select("id").limit(1)

        if (expedientesTableCheckError) {
          console.error("Error checking expedientes table:", expedientesTableCheckError)
          setExpedientesTableExists(false)
        } else {
          // Obtener datos de expedientes por estado
          const { data: expedientesRawData, error: expedientesError } = await supabase
            .from("expedientes")
            .select("estado")

          if (expedientesError) {
            console.error("Error fetching expedientes:", expedientesError)
          } else if (expedientesRawData) {
            // Procesar datos para el gráfico
            const estadosCount = {}
            expedientesRawData.forEach((exp) => {
              const estado = exp.estado || "Sin estado"
              estadosCount[estado] = (estadosCount[estado] || 0) + 1
            })

            const chartData = Object.entries(estadosCount).map(([name, value]) => ({
              name,
              value,
            }))

            setExpedientesData(chartData)
          }
        }

        // Verificar si la tabla tareas existe
        const { error: tareasTableCheckError } = await supabase.from("tareas").select("id").limit(1)

        if (tareasTableCheckError) {
          console.error("Error checking tareas table:", tareasTableCheckError)
          setTareasTableExists(false)
        } else {
          // Obtener datos de tareas por estado de cumplimiento
          const { data: tareasRawData, error: tareasError } = await supabase
            .from("tareas")
            .select("cumplida, fecha_vencimiento")

          if (tareasError) {
            console.error("Error fetching tareas:", tareasError)
          } else if (tareasRawData) {
            // Procesar datos para el gráfico
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            let cumplidas = 0
            let pendientes = 0
            let vencidas = 0

            tareasRawData.forEach((tarea) => {
              if (tarea.cumplida) {
                cumplidas++
              } else {
                const fechaVencimiento = new Date(tarea.fecha_vencimiento)
                if (fechaVencimiento < today) {
                  vencidas++
                } else {
                  pendientes++
                }
              }
            })

            const chartData = [
              { name: "Cumplidas", value: cumplidas },
              { name: "Pendientes", value: pendientes },
              { name: "Vencidas", value: vencidas },
            ]

            setTareasData(chartData)
          }
        }
      } catch (err) {
        console.error("Error fetching chart data:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Expedientes por Estado</CardTitle>
          <CardDescription>Distribución de expedientes según su estado</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Skeleton className="h-64 w-full" />
            </div>
          ) : !expedientesTableExists ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>La tabla 'expedientes' no existe en la base de datos.</AlertDescription>
            </Alert>
          ) : expedientesData.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No hay datos disponibles</p>
            </div>
          ) : (
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
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estado de Tareas</CardTitle>
          <CardDescription>Distribución de tareas según su estado</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Skeleton className="h-64 w-full" />
            </div>
          ) : !tareasTableExists ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>La tabla 'tareas' no existe en la base de datos.</AlertDescription>
            </Alert>
          ) : tareasData.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No hay datos disponibles</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={tareasData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Cantidad" fill="#8884d8">
                  {tareasData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardCharts
