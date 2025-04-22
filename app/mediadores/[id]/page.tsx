import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase-client"
import { ArrowLeft, Pencil } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function MediadorDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: mediador, error } = await supabase.from("mediadores").select("*").eq("id", params.id).single()

  if (error || !mediador) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/mediadores">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Volver</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{mediador.nombre}</h1>
        </div>
        <Button asChild>
          <Link href={`/mediadores/${params.id}/editar`}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Información de Contacto</h2>
            <div className="border-t mt-2 pt-2">
              <dl className="divide-y">
                <div className="py-2 grid grid-cols-3">
                  <dt className="font-medium">Teléfono</dt>
                  <dd className="col-span-2">{mediador.telefono || "-"}</dd>
                </div>
                <div className="py-2 grid grid-cols-3">
                  <dt className="font-medium">Email</dt>
                  <dd className="col-span-2">{mediador.email || "-"}</dd>
                </div>
                <div className="py-2 grid grid-cols-3">
                  <dt className="font-medium">Dirección</dt>
                  <dd className="col-span-2">{mediador.direccion || "-"}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Detalles Profesionales</h2>
            <div className="border-t mt-2 pt-2">
              <dl className="divide-y">
                <div className="py-2 grid grid-cols-3">
                  <dt className="font-medium">Entidad</dt>
                  <dd className="col-span-2">{mediador.entidad || "-"}</dd>
                </div>
                <div className="py-2 grid grid-cols-3">
                  <dt className="font-medium">Notas</dt>
                  <dd className="col-span-2 whitespace-pre-line">{mediador.notas || "-"}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
