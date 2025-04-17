import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { ExpedientesTable } from "@/components/expedientes/expedientes-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

// Marcar la página como dinámica
export const dynamic = "force-dynamic"

export default async function ExpedientesPage() {
  const supabase = createServerComponentClient({ cookies })

  // Modificar la consulta para corregir la referencia a la tabla juzgados
  const { data: expedientes, error } = await supabase
    .from("expedientes")
    .select(`
    id,
    numero,
    numero_judicial,
    fecha_inicio,
    fecha_inicio_judicial,
    monto_total,
    expediente_estados (
      estados_expediente (
        id,
        nombre,
        color
      )
    ),
    expediente_personas (
      rol,
      personas (
        id,
        nombre
      )
    ),
    juzgado_id
  `)
    .order("fecha_creacion", { ascending: false })

  if (error) {
    console.error("Error al cargar expedientes:", error)
  }

  // Si necesitamos información de los juzgados, podemos hacer una consulta separada
  const { data: juzgadosData } = await supabase.from("juzgados").select("id, personas (id, nombre)")

  // Obtener todos los estados posibles para el filtro
  const { data: estados } = await supabase.from("estados_expediente").select("id, nombre, color").order("nombre")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Expedientes</h1>
        <Button asChild>
          <Link href="/expedientes/nuevo">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Expediente
          </Link>
        </Button>
      </div>

      <ExpedientesTable expedientes={expedientes || []} estados={estados || []} />
    </div>
  )
}
