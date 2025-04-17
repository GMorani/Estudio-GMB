import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { AbogadosTable } from "@/components/abogados/abogados-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

// Marcar la página como dinámica
export const dynamic = "force_dynamic"

export default async function AbogadosPage() {
  const supabase = createServerComponentClient({ cookies })

  // Obtener todos los abogados
  const { data: abogados, error } = await supabase
    .from("personas")
    .select(`
    id,
    nombre,
    dni_cuit,
    telefono,
    email,
    domicilio,
    abogados (
      id
    )
  `)
    .eq("tipo_id", 2) // Asumiendo que tipo_id 2 es para abogados
    .order("nombre")

  if (error) {
    console.error("Error al cargar abogados:", error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Abogados</h1>
        <Button asChild>
          <Link href="/abogados/nuevo">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Abogado
          </Link>
        </Button>
      </div>

      <AbogadosTable abogados={abogados || []} />
    </div>
  )
}
