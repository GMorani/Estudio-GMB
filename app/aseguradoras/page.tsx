import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { AseguradorasTable } from "@/components/aseguradoras/aseguradoras-table"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AseguradorasPage() {
  const supabase = createServerComponentClient({ cookies })

  // Obtener todas las aseguradoras
  const { data: aseguradoras, error } = await supabase
    .from("personas")
    .select("id, nombre, dni_cuit, domicilio, telefono, email")
    .eq("tipo_id", 3) // Tipo aseguradora
    .order("nombre")

  const hasAseguradoras = aseguradoras && aseguradoras.length > 0

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

      {hasAseguradoras ? (
        <AseguradorasTable aseguradoras={aseguradoras} />
      ) : (
        <div className="rounded-md border p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">No hay aseguradoras para mostrar</h2>
          <p className="text-muted-foreground mb-4">Comienza agregando una nueva aseguradora a tu sistema.</p>
          <Button asChild>
            <Link href="/aseguradoras/nuevo">
              <PlusCircle className="mr-2 h-4 w-4" />
              Agregar Aseguradora
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
