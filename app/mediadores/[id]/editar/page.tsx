import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { MediadorForm } from "@/components/mediadores/mediador-form"

// Marcar la página como dinámica
export const dynamic = "force-dynamic"

export default async function EditarMediadorPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerComponentClient({ cookies })

  // Obtener datos del mediador
  const { data: mediador, error } = await supabase
    .from("personas")
    .select(`
      id,
      nombre,
      dni_cuit,
      telefono,
      email,
      domicilio,
      mediadores (
        id
      )
    `)
    .eq("id", params.id)
    .single()

  if (error || !mediador) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Editar Mediador</h1>
      <MediadorForm mediador={mediador} />
    </div>
  )
}
