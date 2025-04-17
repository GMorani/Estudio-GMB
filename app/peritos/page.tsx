import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { PeritosTable } from "@/components/peritos/peritos-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

// Marcar la página como dinámica
export const dynamic = "force-dynamic"

export default async function PeritosPage() {
  const supabase = createServerComponentClient({ cookies })

  // Obtener todos los peritos
  const { data: peritos, error } = await supabase
    .from("personas")
    .select(`
      id,
      nombre,
      dni_cuit,
      telefono,
      email,
      domicilio,
      peritos (
        id
      )
    `)
    .eq("tipo_id", 6) // Asumiendo que tipo_id 6 es para peritos
    .order("nombre")

  if (error) {
    console.error("Error al cargar peritos:", error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Peritos</h1>
        <Button asChild>
          <Link href="/peritos/nuevo">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Perito
          </Link>
        </Button>
      </div>

      <PeritosTable peritos={peritos || []} />
    </div>
  )
}
