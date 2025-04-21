"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { formatDate } from "@/lib/utils"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function RecentClientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tableExists, setTableExists] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchClientes() {
      try {
        setLoading(true)

        // Verificar si la tabla clientes existe
        const { error: tableCheckError } = await supabase.from("clientes").select("id").limit(1)

        if (tableCheckError) {
          console.error("Error checking table:", tableCheckError)
          setTableExists(false)
          setError("La tabla 'clientes' no existe en la base de datos.")
          setLoading(false)
          return
        }

        // Obtener una muestra para ver qué columnas están disponibles
        const { data: sampleData, error: sampleError } = await supabase.from("clientes").select("*").limit(1)

        if (sampleError) {
          console.error("Error fetching sample:", sampleError)
          setError(sampleError.message)
          setLoading(false)
          return
        }

        if (!sampleData || sampleData.length === 0) {
          setClientes([])
          setLoading(false)
          return
        }

        // Determinar qué columnas usar basado en lo que está disponible
        const sample = sampleData[0]
        console.log("Columnas disponibles:", Object.keys(sample))

        // Determinar qué columna usar para ordenar
        let orderColumn = "id"
        if ("fecha_alta" in sample) orderColumn = "fecha_alta"
        else if ("created_at" in sample) orderColumn = "created_at"

        // Construir la consulta para obtener clientes con sus personas relacionadas
        const { data, error } = await supabase
          .from("clientes")
          .select("*, personas(*)")
          .order(orderColumn, { ascending: false })
          .limit(5)

        if (error) {
          console.error("Error fetching clientes:", error)
          setError(error.message)
        } else {
          setClientes(data || [])
        }
      } catch (err) {
        console.error("Error fetching clientes:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchClientes()
  }, [supabase])

  if (!tableExists) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Clientes Recientes</CardTitle>
          <CardDescription>Los últimos clientes registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              La tabla 'clientes' no existe en la base de datos. Por favor, cree la tabla para ver los clientes
              recientes.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Clientes Recientes</CardTitle>
          <CardDescription>Los últimos clientes registrados</CardDescription>
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
    <Card>
      <CardHeader>
        <CardTitle>Clientes Recientes</CardTitle>
        <CardDescription>Los últimos clientes registrados</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : clientes.length === 0 ? (
          <p className="text-muted-foreground">No hay clientes registrados.</p>
        ) : (
          <div className="space-y-4">
            {clientes.map((cliente) => {
              // Obtener información de la persona si está disponible
              const persona = cliente.personas || {}
              const nombre = persona.nombre || "Sin nombre"
              const apellido = persona.apellido || ""
              const nombreCompleto = `${nombre} ${apellido}`.trim()

              // Determinar qué campos usar
              const id = cliente.id || "N/A"
              const fecha = cliente.fecha_alta || cliente.created_at || "Fecha desconocida"

              return (
                <div key={id} className="flex items-start space-x-4 border-b pb-4 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium">{nombreCompleto}</p>
                    <p className="text-sm text-muted-foreground">
                      Cliente desde: {typeof fecha === "string" ? fecha : formatDate(fecha)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RecentClientes
