import { notFound } from "next/navigation"
import { MediadorForm } from "@/components/mediadores/mediador-form"
import { createClient } from "@/lib/supabase-client"

export const dynamic = "force-dynamic"

export default async function EditarMediadorPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: mediador, error } = await supabase.from("mediadores").select("*").eq("id", params.id).single()

  if (error || !mediador) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editar Mediador</h1>
        <p className="text-muted-foreground">Actualiza la información del mediador.</p>
      </div>
      <div className="border rounded-lg p-6">
        <MediadorForm mediador={mediador} />
      </div>
    </div>
  )
}
