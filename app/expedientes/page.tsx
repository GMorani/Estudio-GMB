import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ExpedientesTableSimple } from "@/components/expedientes/expedientes-table-simple"
import { ExpedientesFilter } from "@/components/expedientes/expedientes-filter"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata = {
  title: "Expedientes | Estudio GMB",
  description: "Gestión de expedientes legales",
}

export default function ExpedientesPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expedientes</h1>
          <p className="text-muted-foreground">Gestiona todos los expedientes legales del estudio</p>
        </div>
        <Button asChild>
          <Link href="/expedientes/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Expediente
          </Link>
        </Button>
      </div>

      <ExpedientesFilter />
      <ExpedientesTableSimple />
    </div>
  )
}
