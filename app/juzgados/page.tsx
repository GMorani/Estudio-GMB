import Link from "next/link"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { JuzgadosTableFilterable } from "@/components/juzgados/juzgados-table-filterable"

// Marcar la página como dinámica
export const dynamic = "force-dynamic"

export default async function JuzgadosPage() {
  const supabase = createServerComponentClient({ cookies })

  // Obtener todos los juzgados
  const { data: juzgados, error } = await supabase
    .from("personas")
    .select(`
      id,
      nombre,
      domicilio,
      telefono,
      email,
      juzgados (
        nombre_juez,
        nombre_secretario
      )
    `)
    .eq("tipo_id", 4) // Tipo juzgado
    .order("nombre", { ascending: true })

  // Procesar los datos para incluir los campos de juzgados
  const juzgadosData =
    juzgados?.map((juzgado) => ({
      id: juzgado.id,
      nombre: juzgado.nombre,
      domicilio: juzgado.domicilio,
      telefono: juzgado.telefono,
      email: juzgado.email,
      nombre_juez: juzgado.juzgados?.nombre_juez || null,
      nombre_secretario: juzgado.juzgados?.nombre_secretario || null,
    })) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Juzgados</h1>
        <Button asChild>
          <Link href="/juzgados/nuevo">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Juzgado
          </Link>
        </Button>
      </div>

      {error ? (
        <div className="rounded-md bg-destructive/15 p-4">
          <p className="text-destructive">Error al cargar los juzgados: {error.message}</p>
        </div>
      ) : juzgadosData.length === 0 ? (
        <div className="rounded-md border p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">No hay juzgados para mostrar</h2>
          <p className="text-muted-foreground mb-4">Comienza agregando un nuevo juzgado a tu sistema.</p>
          <Button asChild>
            <Link href="/juzgados/nuevo">
              <PlusCircle className="mr-2 h-4 w-4" />
              Agregar Juzgado
            </Link>
          </Button>
        </div>
      ) : (
        <JuzgadosTableFilterable juzgados={juzgadosData} />
      )}
    </div>
  )
}
