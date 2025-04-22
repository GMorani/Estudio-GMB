import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { PeritosTable } from "@/components/peritos/peritos-table"
import { createClient } from "@/lib/supabase-client"

export const dynamic = "force-dynamic"

export default async function PeritosPage() {
  const supabase = createClient()

  // Obtener todos los peritos
  const { data: peritos, error } = await supabase.from("peritos").select("*").order("nombre", { ascending: true })

  const hasPeritos = peritos && peritos.length > 0

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

      {error && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <p className="text-red-800">Error al cargar peritos: {error.message}</p>
        </div>
      )}

      {!error &&
        (hasPeritos ? (
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
        ))}
    </div>
  )
}
