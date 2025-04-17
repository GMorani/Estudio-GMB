import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { ExpedientesTableSimple } from "@/components/expedientes/expedientes-table-simple"

// Marcar la página como dinámica
export const dynamic = "force-dynamic"

export default async function ExpedientesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createServerComponentClient({ cookies })

  // Obtener el conteo de expedientes para saber si hay datos
  const { count, error } = await supabase.from("expedientes").select("*", { count: "exact", head: true })

  if (error) {
    console.error("Error al contar expedientes:", error)
  }

  const expedientesCount = count || 0

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

      {expedientesCount > 0 ? (
        <ExpedientesTableSimple searchParams={searchParams} />
      ) : (
        <div className="rounded-md border p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">No hay expedientes para mostrar</h2>
          <p className="text-muted-foreground mb-4">Comienza agregando un nuevo expediente a tu sistema.</p>
          <Button asChild>
            <Link href="/expedientes/nuevo">
              <PlusCircle className="mr-2 h-4 w-4" />
              Agregar Expediente
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
