import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { MediadoresTable } from "@/components/mediadores/mediadores-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

// Marcar la página como dinámica
export const dynamic = "force-dynamic"

export default async function MediadoresPage() {
  const supabase = createServerComponentClient({ cookies })

  // Obtener todos los mediadores
  const { data: mediadores, error } = await supabase
    .from("personas")
    .select(`
      id,
      nombre,
      dni_cuit,
      telefono,
      email,
      domicilio,
      mediadores (
        id
      )
    `)
    .eq("tipo_id", 5) // Asumiendo que tipo_id 5 es para mediadores
    .order("nombre")

  if (error) {
    console.error("Error al cargar mediadores:", error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mediadores</h1>
        <Button asChild>
          <Link href="/mediadores/nuevo">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Mediador
          </Link>
        </Button>
      </div>

      <MediadoresTable mediadores={mediadores || []} />
    </div>
  )
}
