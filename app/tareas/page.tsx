import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { TareasTable } from "@/components/tareas/tareas-table"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function TareasPage() {
  const supabase = createServerComponentClient({ cookies })

  try {
    // Obtener todas las tareas pendientes con información del expediente relacionado
    const { data: tareas, error } = await supabase
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
          autos
        )
      `)
      .eq("cumplida", false)
      .order("fecha_vencimiento", { ascending: true })

    if (error) {
      console.error("Error al cargar tareas:", error)
      throw error
    }

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tareas Pendientes</h1>
          <p className="text-muted-foreground">Gestiona las tareas pendientes de todos los expedientes.</p>
        </div>

        <TareasTable tareas={tareas || []} />
      </div>
    )
  } catch (error) {
    console.error("Error en TareasPage:", error)
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tareas Pendientes</h1>
          <p className="text-muted-foreground">Gestiona las tareas pendientes de todos los expedientes.</p>
        </div>
        <div className="rounded-md bg-destructive/10 p-4">
          <p className="text-destructive">Error al cargar las tareas. Por favor, intente nuevamente.</p>
        </div>
      </div>
    )
  }
}
