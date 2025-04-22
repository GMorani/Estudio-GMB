import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { PeritosTable } from "@/components/peritos/peritos-table"

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
        id,
        especialidad
      )
    `)
    .not("peritos", "is", null)

  if (error) {
    console.error("Error al obtener peritos:", error)
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

      {peritos && peritos.length > 0 ? (
        <PeritosTable peritos={peritos} />
      ) : (
        <div className="rounded-md border p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">No hay peritos para mostrar</h2>
          <p className="text-muted-foreground mb-4">Comienza agregando un nuevo perito a tu sistema.</p>
          <Button asChild>
            <Link href="/peritos/nuevo">
              <PlusCircle className="mr-2 h-4 w-4" />
              Agregar Perito
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
