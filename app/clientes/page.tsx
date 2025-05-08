import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { ClientesTable } from "@/components/clientes/clientes-table"

// Marcar la página como dinámica
export const dynamic = "force-dynamic"

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
    .eq("tipo_id", 1) // Tipo cliente
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

      {clientes && clientes.length > 0 ? (
        <ClientesTable clientes={clientes} />
      ) : (
        <div className="rounded-md border p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">No hay clientes para mostrar</h2>
          <p className="text-muted-foreground mb-4">Comienza agregando un nuevo cliente a tu sistema.</p>
          <Button asChild>
            <Link href="/clientes/nuevo">
              <PlusCircle className="mr-2 h-4 w-4" />
              Agregar Cliente
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
