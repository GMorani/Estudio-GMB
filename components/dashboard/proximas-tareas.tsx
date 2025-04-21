"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function ProximasTareas() {
  const [tareas, setTareas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchTareas() {
      try {
        setLoading(true)

        // Primero, obtener una muestra para ver qué columnas están disponibles en tareas
        const { data: sampleTareas, error: sampleTareasError } = await supabase.from("tareas").select("*").limit(1)

        if (sampleTareasError) throw sampleTareasError

        // Determinar qué columnas usar basado en lo que está disponible en tareas
        const hasFechaVencimiento = sampleTareas[0] && "fecha_vencimiento" in sampleTareas[0]
        const hasExpedienteId = sampleTareas[0] && "expediente_id" in sampleTareas[0]

        // Si no hay columna expediente_id, no podemos hacer join
        if (!hasExpedienteId) {
          const { data, error } = await supabase
            .from("tareas")
            .select("*")
            .order(hasFechaVencimiento ? "fecha_vencimiento" : "id", { ascending: true })
            .limit(5)

          if (error) throw error

          setTareas(data || [])
          setLoading(false)
          return
        }

        // Ahora, obtener una muestra para ver qué columnas están disponibles en expedientes
        const { data: sampleExpedientes, error: sampleExpedientesError } = await supabase
          .from("expedientes")
          .select("*")
          .limit(1)

        if (sampleExpedientesError) throw sampleExpedientesError

        // Determinar qué columnas usar basado en lo que está disponible en expedientes
        const hasNumero = sampleExpedientes[0] && "numero" in sampleExpedientes[0]
        const hasReferencia = sampleExpedientes[0] && "referencia" in sampleExpedientes[0]

        // Construir la consulta basada en las columnas disponibles
        let query = supabase
          .from("tareas")
          .select(`
            id,
            titulo,
            descripcion,
            ${hasFechaVencimiento ? "fecha_vencimiento," : ""}
            estado,
            expediente_id,
            expedientes:expediente_id (
              id,
              ${hasNumero ? "numero," : ""}
              ${hasReferencia ? "referencia," : ""}
              estado
            )
          `)
          .limit(5)

        // Determinar por qué columna ordenar
        if (hasFechaVencimiento) {
          query = query.order("fecha_vencimiento", { ascending: true })
        } else {
          query = query.order("id", { ascending: false })
        }

        const { data, error } = await query

        if (error) throw error

        setTareas(data || [])
      } catch (error) {
        console.error("Error fetching tareas:", error.message)
        setError(`Error fetching tareas: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchTareas()
  }, [supabase])

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Próximas Tareas</CardTitle>
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
        <CardTitle>Próximas Tareas</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          </div>
        ) : tareas.length > 0 ? (
          <div className="space-y-4">
            {tareas.map((tarea) => {
              // Determinar qué usar como identificador del expediente
              const expediente = tarea.expedientes || {}
              const expedienteId =
                expediente.numero || expediente.referencia || `#${expediente.id || tarea.expediente_id || "N/A"}`

              // Determinar qué usar como fecha
              const date = tarea.fecha_vencimiento || "Fecha no disponible"
              const formattedDate = typeof date === "string" ? date : new Date(date).toLocaleDateString()

              return (
                <div key={tarea.id} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium">{tarea.titulo || `Tarea #${tarea.id}`}</p>
                    <p className="text-sm text-muted-foreground">
                      Expediente: {expedienteId} • {formattedDate}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-muted-foreground">No hay tareas pendientes para mostrar.</p>
        )}
      </CardContent>
    </Card>
  )
}
