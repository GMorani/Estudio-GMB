import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { ExpedientesTable } from "@/components/expedientes/expedientes-table"
import { Button } from "@/components/ui/button"
import { ExpedientesFilter } from "@/components/expedientes/expedientes-filter"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

// Marcar la página como dinámica
export const dynamic = "force-dynamic"

export default async function ExpedientesPage() {
  const supabase = createServerComponentClient({ cookies })

  // Obtener todos los estados para el filtro
  const { data: estados } = await supabase.from("estados_expediente").select("id, nombre, color").order("nombre")

  // Obtener todas las personas para el filtro
  const { data: personas } = await supabase.from("personas").select("id, nombre").order("nombre")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Módulo de Expedientes</h1>
        <Button asChild>
          <Link href="/expedientes/nuevo">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Expediente
          </Link>
        </Button>
      </div>

      <ExpedientesFilter estados={estados || []} personas={personas || []} />
      <ExpedientesTable />
    </div>
  )
}
