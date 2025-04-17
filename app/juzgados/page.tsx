import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { JuzgadosTable } from "@/components/juzgados/juzgados-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

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
      dni_cuit,
      telefono,
      email,
      domicilio,
      juzgados (
        id
      )
    `)
    .eq("tipo_id", 4) // Asumiendo que tipo_id 4 es para juzgados
    .order("nombre")

  if (error) {
    console.error("Error al cargar juzgados:", error)
  }

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

      <JuzgadosTable juzgados={juzgados || []} />
    </div>
  )
}
