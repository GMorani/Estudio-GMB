"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent } from "@/components/ui/card"
import { TareasTable } from "@/components/tareas/tareas-table"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

type ExpedienteConTareas = {
  id: string
  numero: string
  autos: string
  fecha_inicio: string
  estado: {
    id: number
    nombre: string
    color: string
  } | null
  persona: {
    id: number
    nombre: string
  } | null
  tareas: {
    id: number
    descripcion: string
    fecha_vencimiento: string
    cumplida: boolean
  }[]
  proximaTarea: {
    id: number
    descripcion: string
    fecha_vencimiento: string
  } | null
}

export function ExpedientesTareasPendientes({ vencidas = false }: { vencidas?: boolean }) {
  const supabase = createClientComponentClient()
  const [expedientes, setExpedientes] = useState<ExpedienteConTareas[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tableExists, setTableExists] = useState(true)

  useEffect(() => {
    async function fetchTareas() {
      try {
        setIsLoading(true)
        setError(null)

        // Verificar si la tabla tareas_expediente existe
        const { error: tableCheckError } = await supabase.from("tareas_expediente").select("id").limit(1)

        if (tableCheckError) {
          if (tableCheckError.message.includes("does not exist")) {
            setTableExists(false)
            setIsLoading(false)
            return
          }
          throw tableCheckError
        }

        // Obtener la fecha actual
        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)

        // Construir la consulta base
        let query = supabase
          .from("tareas_expediente")
          .select(`
            id,
            descripcion,
            fecha_vencimiento,
            cumplida,
            expediente_id,
            expedientes (
              id,
              numero,
              autos,
              fecha_inicio,
              expediente_estados (
                estados_expediente (
                  id,
                  nombre,
                  color
                )
              ),
              expediente_personas (
                personas (
                  id,
                  nombre
                )
              )
            )
          `)
          .eq("cumplida", false)

        // Filtrar por fecha de vencimiento según el parámetro vencidas
        if (vencidas) {
          query = query.lt("fecha_vencimiento", hoy.toISOString())
        } else {
          query = query.gte("fecha_vencimiento", hoy.toISOString())
        }

        // Ordenar por fecha de vencimiento
        query = query.order("fecha_vencimiento", { ascending: true })

        const { data: tareasData, error: tareasError } = await query

        if (tareasError) throw tareasError

        // Transformar los datos para agruparlos por expediente
        const expedientesMap = new Map<string, ExpedienteConTareas>()

        tareasData?.forEach((tarea) => {
          if (!tarea.expedientes) return

          const expedienteId = tarea.expediente_id
          const expediente = tarea.expedientes

          if (!expedientesMap.has(expedienteId)) {
            // Obtener el estado actual (el último en la lista)
            const estados = expediente.expediente_estados || []
            const estadoActual = estados.length > 0 ? estados[estados.length - 1]?.estados_expediente : null

            // Obtener la primera persona asociada (generalmente el cliente principal)
            const personas = expediente.expediente_personas || []
            const personaPrincipal = personas.length > 0 ? personas[0]?.personas : null

            expedientesMap.set(expedienteId, {
              id: expediente.id,
              numero: expediente.numero || expediente.id,
              autos: expediente.autos || "Sin descripción",
              fecha_inicio: expediente.fecha_inicio,
              estado: estadoActual,
              persona: personaPrincipal,
              tareas: [],
              proximaTarea: null,
            })
          }

          // Añadir la tarea al expediente
          const expedienteData = expedientesMap.get(expedienteId)
          if (expedienteData) {
            expedienteData.tareas.push({
              id: tarea.id,
              descripcion: tarea.descripcion,
              fecha_vencimiento: tarea.fecha_vencimiento,
              cumplida: tarea.cumplida,
            })

            // Actualizar la próxima tarea si es necesario
            if (
              !expedienteData.proximaTarea ||
              new Date(tarea.fecha_vencimiento) < new Date(expedienteData.proximaTarea.fecha_vencimiento)
            ) {
              expedienteData.proximaTarea = {
                id: tarea.id,
                descripcion: tarea.descripcion,
                fecha_vencimiento: tarea.fecha_vencimiento,
              }
            }
          }
        })

        // Convertir el Map a un array y ordenar por la fecha de la próxima tarea
        const expedientesArray = Array.from(expedientesMap.values()).sort((a, b) => {
          if (!a.proximaTarea) return 1
          if (!b.proximaTarea) return -1
          return (
            new Date(a.proximaTarea.fecha_vencimiento).getTime() - new Date(b.proximaTarea.fecha_vencimiento).getTime()
          )
        })

        setExpedientes(expedientesArray)
      } catch (error) {
        console.error("Error al cargar tareas:", error)
        setError(error instanceof Error ? error.message : "Error al cargar las tareas")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTareas()
  }, [supabase, vencidas])

  if (!tableExists) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Tabla no encontrada</AlertTitle>
        <AlertDescription>
          La tabla de tareas no existe en la base de datos. Por favor, crea la tabla para utilizar esta funcionalidad.
        </AlertDescription>
      </Alert>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  // Si no hay expedientes con tareas, mostrar mensaje
  if (expedientes.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <div className="rounded-full bg-primary/10 p-3 mb-4">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-medium mb-2">No hay tareas {vencidas ? "vencidas" : "pendientes"}</h3>
          <p className="text-muted-foreground text-center max-w-md">
            {vencidas ? "No hay tareas vencidas. ¡Buen trabajo!" : "No hay tareas pendientes para los próximos días."}
          </p>
        </CardContent>
      </Card>
    )
  }

  // Extraer todas las tareas de todos los expedientes
  const todasLasTareas = expedientes.flatMap((expediente) =>
    expediente.tareas.map((tarea) => ({
      ...tarea,
      expediente_id: expediente.id,
      expedientes: {
        id: expediente.id,
        numero: expediente.numero,
        autos: expediente.autos,
      },
    })),
  )

  return (
    <div className="space-y-6">
      <TareasTable tareas={todasLasTareas} />
    </div>
  )
}
