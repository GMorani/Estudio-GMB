import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export default function MediadoresPage() {
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

      <div className="rounded-md border p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">No hay mediadores para mostrar</h2>
        <p className="text-muted-foreground mb-4">Comienza agregando un nuevo mediador a tu sistema.</p>
        <Button asChild>
          <Link href="/mediadores/nuevo">
            <PlusCircle className="mr-2 h-4 w-4" />
            Agregar Mediador
          </Link>
        </Button>
      </div>
    </div>
  )
}
