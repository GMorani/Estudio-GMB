"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function RecentActivities() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchActivities() {
      try {
        setLoading(true)

        // Primero, obtener una muestra para ver qué columnas están disponibles
        const { data: sampleData, error: sampleError } = await supabase.from("expedientes").select("*").limit(1)

        if (sampleError) throw sampleError

        // Determinar qué columnas usar basado en lo que está disponible
        const hasNumero = sampleData[0] && "numero" in sampleData[0]
        const hasReferencia = sampleData[0] && "referencia" in sampleData[0]
        const hasFechaAlta = sampleData[0] && "fecha_alta" in sampleData[0]
        const hasCreatedAt = sampleData[0] && "created_at" in sampleData[0]

        // Construir la consulta basada en las columnas disponibles
        let query = supabase
          .from("expedientes")
          .select(`
            id,
            ${hasNumero ? "numero," : ""}
            ${hasReferencia ? "referencia," : ""}
            ${hasFechaAlta ? "fecha_alta," : ""}
            ${hasCreatedAt ? "created_at," : ""}
            estado
          `)
          .limit(5)

        // Determinar por qué columna ordenar
        if (hasFechaAlta) {
          query = query.order("fecha_alta", { ascending: false })
        } else if (hasCreatedAt) {
          query = query.order("created_at", { ascending: false })
        } else {
          query = query.order("id", { ascending: false })
        }

        const { data, error } = await query

        if (error) throw error

        setActivities(data || [])
      } catch (error) {
        console.error("Error fetching activities:", error.message)
        setError(`Error fetching activities: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [supabase])

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actividades Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividades Recientes</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => {
              // Determinar qué usar como identificador del expediente
              const expedienteId = activity.numero || activity.referencia || `#${activity.id}`

              // Determinar qué usar como fecha
              const date = activity.fecha_alta || activity.created_at || "Fecha no disponible"
              const formattedDate = typeof date === "string" ? date : new Date(date).toLocaleDateString()

              return (
                <div key={activity.id} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium">Expediente {expedienteId}</p>
                    <p className="text-sm text-muted-foreground">
                      Estado: {activity.estado || "No especificado"} • {formattedDate}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-muted-foreground">No hay actividades recientes para mostrar.</p>
        )}
      </CardContent>
    </Card>
  )
}
