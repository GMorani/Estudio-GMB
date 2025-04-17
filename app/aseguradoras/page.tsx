import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { AseguradorasTable } from "@/components/aseguradoras/aseguradoras-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

// Marcar la página como dinámica
export const dynamic = "force-dynamic"

export default async function AseguradorasPage() {
  const supabase = createServerComponentClient({ cookies })

  // Obtener todas las aseguradoras
  const { data: aseguradoras, error } = await supabase
    .from("personas")
    .select(`
      id,
      nombre,
      dni_cuit,
      telefono,
      email,
      domicilio,
      aseguradoras (
        id
      )
    `)
    .eq("tipo_id", 3) // Asumiendo que tipo_id 3 es para aseguradoras
    .order("nombre")

  if (error) {
    console.error("Error al cargar aseguradoras:", error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Aseguradoras</h1>
        <Button asChild>
          <Link href="/aseguradoras/nuevo">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nueva Aseguradora
          </Link>
        </Button>
      </div>

      <AseguradorasTable aseguradoras={aseguradoras || []} />
    </div>
  )
}
