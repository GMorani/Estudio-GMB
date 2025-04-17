import { Button } from "@/components/ui/button"
import { ExpedientesTableSimple } from "@/components/expedientes/expedientes-table-simple"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

// Marcar la página como dinámica
export const dynamic = "force-dynamic"

export default function ExpedientesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Módulo de Expedientes</h1>
        <Button asChild>
          <Link href="/expedientes/nuevo">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Expediente
          </Link>
        </Button>
      </div>

      <ExpedientesTableSimple />
    </div>
  )
}
