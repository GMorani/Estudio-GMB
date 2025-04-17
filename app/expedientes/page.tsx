import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export default function ExpedientesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Expedientes</h1>
        <Button asChild>
          <Link href="/expedientes/nuevo">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Expediente
          </Link>
        </Button>
      </div>

      <div className="rounded-md border p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">No hay expedientes para mostrar</h2>
        <p className="text-muted-foreground mb-4">Comienza agregando un nuevo expediente a tu sistema.</p>
        <Button asChild>
          <Link href="/expedientes/nuevo">
            <PlusCircle className="mr-2 h-4 w-4" />
            Agregar Expediente
          </Link>
        </Button>
      </div>
    </div>
  )
}
