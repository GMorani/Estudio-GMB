import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { ClientesTable } from "@/components/clientes/clientes-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

export default async function ClientesPage() {
  const supabase = createServerComponentClient({ cookies })

  // Obtener todos los clientes
  const { data: clientes, error } = await supabase
    .from("personas")
    .select(`
      id,
      nombre,
      dni_cuit,
      telefono,
      email,
      domicilio,
      clientes (
        referido
      )
    `)
    .eq("tipo_id", 1) // Asumiendo que tipo_id 1 es para clientes
    .order("nombre")

  if (error) {
    console.error("Error al cargar clientes:", error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <Button asChild>
          <Link href="/clientes/nuevo">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Link>
        </Button>
      </div>

      <ClientesTable clientes={clientes || []} />
    </div>
  )
}
