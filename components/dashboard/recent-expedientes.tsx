"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { formatDate } from "@/lib/utils"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

export function RecentExpedientes() {
  const [expedientes, setExpedientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tableExists, setTableExists] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchExpedientes() {
      try {
        setLoading(true)

        // Verificar si la tabla expedientes existe
        const { error: tableCheckError } = await supabase.from("expedientes").select("id").limit(1)

        if (tableCheckError) {
          console.error("Error checking table:", tableCheckError)
          setTableExists(false)
          setError("La tabla 'expedientes' no existe en la base de datos.")
          setLoading(false)
          return
        }

        // Obtener una muestra para ver qué columnas están disponibles
        const { data: sampleData, error: sampleError } = await supabase.from("expedientes").select("*").limit(1)

        if (sampleError) {
          console.error("Error fetching sample:", sampleError)
          setError(sampleError.message)
          setLoading(false)
          return
        }

        if (!sampleData || sampleData.length === 0) {
          setExpedientes([])
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

        // Construir la consulta
        const { data, error } = await supabase
          .from("expedientes")
          .select("*")
          .order(orderColumn, { ascending: false })
          .limit(5)

        if (error) {
          console.error("Error fetching expedientes:", error)
          setError(error.message)
        } else {
          setExpedientes(data || [])
        }
      } catch (err) {
        console.error("Error fetching expedientes:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchExpedientes()
  }, [supabase])

  if (!tableExists) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expedientes Recientes</CardTitle>
          <CardDescription>Los últimos expedientes creados</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              La tabla 'expedientes' no existe en la base de datos. Por favor, cree la tabla para ver los expedientes
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
          <CardTitle>Expedientes Recientes</CardTitle>
          <CardDescription>Los últimos expedientes creados</CardDescription>
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
        <CardTitle>Expedientes Recientes</CardTitle>
        <CardDescription>Los últimos expedientes creados</CardDescription>
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
        ) : expedientes.length === 0 ? (
          <p className="text-muted-foreground">No hay expedientes registrados.</p>
        ) : (
          <div className="space-y-4">
            {expedientes.map((expediente) => {
              // Determinar qué campos usar
              const id = expediente.id || "N/A"
              const numero = expediente.numero || expediente.referencia || id
              const fecha = expediente.fecha_alta || expediente.created_at || "Fecha desconocida"
              const estado = expediente.estado || "Estado desconocido"

              return (
                <div key={id} className="flex items-start space-x-4 border-b pb-4 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium">
                      <Link href={`/expedientes/${expediente.id}`}>{`Expediente #${numero}`}</Link>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Creado: {typeof fecha === "string" ? fecha : formatDate(fecha)}
                    </p>
                  </div>
                  <div>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                      {estado}
                    </span>
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

export default RecentExpedientes
