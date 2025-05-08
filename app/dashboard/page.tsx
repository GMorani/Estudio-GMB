"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Versión simplificada que no depende de Supabase para la carga inicial
export default function DashboardPage() {
  const [capitalTotal, setCapitalTotal] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  useEffect(() => {
    // Cargar datos guardados localmente al inicio
    try {
      const savedCapital = localStorage.getItem("dashboard_capital_total")
      const savedDate = localStorage.getItem("dashboard_last_updated")

      if (savedCapital) {
        setCapitalTotal(Number.parseFloat(savedCapital))
      }

      if (savedDate) {
        const date = new Date(savedDate)
        setLastUpdated(`Última actualización: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`)
      }
    } catch (e) {
      console.error("Error al leer localStorage:", e)
    }
  }, [])

  // Función para simular la carga de datos
  // Esta función puede ser reemplazada más adelante cuando se resuelva el problema de conexión
  const loadDashboardData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Simulamos una carga de datos
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Aquí normalmente cargaríamos datos de Supabase
      // Por ahora, usamos datos estáticos o los que ya tenemos

      // Actualizar la fecha de última actualización
      const now = new Date()
      const formattedDate = `Última actualización: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`
      setLastUpdated(formattedDate)

      // Guardar en localStorage para futuras visitas
      try {
        localStorage.setItem("dashboard_last_updated", now.toISOString())
      } catch (e) {
        console.error("Error al guardar en localStorage:", e)
      }
    } catch (err) {
      console.error("Error al cargar datos:", err)
      setError("No se pudieron cargar los datos más recientes.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido al sistema de gestión del Estudio GMB</p>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-800">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Problema al cargar datos</AlertTitle>
          <AlertDescription>
            {error}
            <button
              onClick={loadDashboardData}
              disabled={loading}
              className="ml-2 inline-flex items-center text-sm font-medium text-amber-800 hover:text-amber-900"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                  Cargando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Reintentar
                </>
              )}
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* Componente para mostrar el Capital Total Reclamado */}
      <Card className="bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">
            Capital Total Reclamado
            {!loading && (
              <button
                onClick={loadDashboardData}
                disabled={loading}
                className="ml-2 inline-flex items-center text-xs font-medium text-gray-500 hover:text-gray-700"
                title="Actualizar datos"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              </button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-40" />
          ) : (
            <>
              <p className="text-3xl font-bold">{formatCurrency(capitalTotal || 0)}</p>
              {lastUpdated && <p className="text-xs text-muted-foreground mt-1">{lastUpdated}</p>}
            </>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="actividades">
        <TabsList>
          <TabsTrigger value="actividades">Actividades Recientes</TabsTrigger>
          <TabsTrigger value="tareas">Tareas Pendientes</TabsTrigger>
          <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
          <TabsTrigger value="clientes">Clientes Recientes</TabsTrigger>
        </TabsList>

        <TabsContent value="actividades" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Actividades Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <p>No hay actividades recientes para mostrar.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tareas" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Tareas Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <p>No hay tareas pendientes para mostrar.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estadisticas" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <p>No hay estadísticas para mostrar.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clientes" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Clientes Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <p>No hay clientes recientes para mostrar.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
