"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { AlertCircle, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

export function DashboardCharts() {
  const [expedientesData, setExpedientesData] = useState([])
  const [estadosData, setEstadosData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const supabase = createClientComponentClient()

  // Colores para los gráficos
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

  // Función auxiliar para verificar si una tabla existe
  async function checkTableExists(tableName) {
    try {
      const { data, error } = await supabase.from(tableName).select("*").limit(1)
      return !error
    } catch (err) {
      console.error(`Error checking if table ${tableName} exists:`, err)
      return false
    }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Verificar si las tablas existen
        const expedientesExists = await checkTableExists("expedientes")
        const estadosExpedienteExists = await checkTableExists("estados_expediente")
        const expedienteEstadosExists = await checkTableExists("expediente_estados")

        if (!expedientesExists) {
          console.log("La tabla 'expedientes' no existe")
          setError("La tabla 'expedientes' no existe en la base de datos")
          setLoading(false)
          return
        }

        // Contar expedientes totales
        const { count: expedientesCount, error: countError } = await supabase
          .from("expedientes")
          .select("*", { count: "exact", head: true })

        if (countError) {
          console.error("Error counting expedientes:", countError)
          setError("Error al contar expedientes: " + countError.message)
        } else {
          // Crear datos para el gráfico de expedientes
          setExpedientesData([{ name: "Total Expedientes", value: expedientesCount || 0 }])
        }

        // Si tenemos las tablas de estados, obtener datos de estados
        if (estadosExpedienteExists && expedienteEstadosExists) {
          // Obtener todos los estados
          const { data: estados, error: estadosError } = await supabase
            .from("estados_expediente")
            .select("id, nombre, color")

          if (estadosError) {
            console.error("Error fetching estados:", estadosError)
          } else if (estados && estados.length > 0) {
            // Obtener conteo de expedientes por estado
            const { data: expedienteEstados, error: expedienteEstadosError } = await supabase
              .from("expediente_estados")
              .select("estado_id, expediente_id")

            if (expedienteEstadosError) {
              console.error("Error fetching expediente_estados:", expedienteEstadosError)
            } else if (expedienteEstados && expedienteEstados.length > 0) {
              // Contar expedientes por estado
              const estadoCount = {}
              expedienteEstados.forEach((item) => {
                estadoCount[item.estado_id] = (estadoCount[item.estado_id] || 0) + 1
              })

              // Crear datos para el gráfico
              const chartData = estados
                .map((estado) => ({
                  name: estado.nombre,
                  value: estadoCount[estado.id] || 0,
                  color: estado.color || COLORS[estado.id % COLORS.length],
                }))
                .filter((item) => item.value > 0) // Solo incluir estados con expedientes

              setEstadosData(chartData)
            }
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err.message)
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
          <CardDescription>Visualización de datos del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Expedientes</CardTitle>
          <CardDescription>Total de expedientes en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : expedientesData.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Sin datos</AlertTitle>
              <AlertDescription>No hay datos de expedientes para mostrar.</AlertDescription>
            </Alert>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px]">
              <div className="text-6xl font-bold">{expedientesData[0].value}</div>
              <div className="text-muted-foreground mt-2">Expedientes registrados</div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estados de Expedientes</CardTitle>
          <CardDescription>Distribución de expedientes por estado</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : estadosData.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Sin datos de estados</AlertTitle>
              <AlertDescription>
                No hay datos de estados de expedientes para mostrar o las tablas necesarias no existen.
              </AlertDescription>
            </Alert>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={estadosData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {estadosData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardCharts
