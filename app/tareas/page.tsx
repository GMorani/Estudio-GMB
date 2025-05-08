import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { ExpedientesTareasPendientes } from "@/components/tareas/expedientes-tareas-pendientes"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function TareasPage() {
  const supabase = createServerComponentClient({ cookies })

  try {
    // Obtener expedientes con tareas pendientes
    const { data: expedientesConTareas, error } = await supabase
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
      .order("fecha_vencimiento", { ascending: true })

    if (error) {
      console.error("Error al cargar tareas:", error)
      throw error
    }

    // Transformar los datos para agruparlos por expediente
    const expedientesMap = new Map()

    expedientesConTareas?.forEach((tarea) => {
      const expedienteId = tarea.expediente_id
      const expediente = tarea.expedientes

      if (!expedientesMap.has(expedienteId)) {
        // Obtener el estado actual (el último en la lista)
        const estados = expediente.expediente_estados || []
        const estadoActual = estados.length > 0 ? estados[estados.length - 1].estados_expediente : null

        // Obtener la primera persona asociada (generalmente el cliente principal)
        const personas = expediente.expediente_personas || []
        const personaPrincipal = personas.length > 0 ? personas[0].personas : null

        expedientesMap.set(expedienteId, {
          id: expediente.id,
          numero: expediente.numero,
          autos: expediente.autos,
          fecha_inicio: expediente.fecha_inicio,
          estado: estadoActual,
          persona: personaPrincipal,
          tareas: [],
          proximaTarea: null,
        })
      }

      // Añadir la tarea al expediente
      const expedienteData = expedientesMap.get(expedienteId)
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
    })

    // Convertir el Map a un array y ordenar por la fecha de la próxima tarea
    const expedientes = Array.from(expedientesMap.values()).sort((a, b) => {
      if (!a.proximaTarea) return 1
      if (!b.proximaTarea) return -1
      return new Date(a.proximaTarea.fecha_vencimiento).getTime() - new Date(b.proximaTarea.fecha_vencimiento).getTime()
    })

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tareas Pendientes</h1>
          <p className="text-muted-foreground">
            Expedientes con tareas pendientes, ordenados por fecha de vencimiento más próxima.
          </p>
        </div>

        <ExpedientesTareasPendientes expedientes={expedientes} />
      </div>
    )
  } catch (error) {
    console.error("Error en TareasPage:", error)
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tareas Pendientes</h1>
          <p className="text-muted-foreground">
            Expedientes con tareas pendientes, ordenados por fecha de vencimiento más próxima.
          </p>
        </div>
        <div className="rounded-md bg-destructive/10 p-4">
          <p className="text-destructive">Error al cargar las tareas. Por favor, intente nuevamente.</p>
        </div>
      </div>
    )
  }
}
