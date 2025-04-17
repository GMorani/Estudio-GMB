import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { AseguradoraForm } from "@/components/aseguradoras/aseguradora-form"

// Marcar la página como dinámica
export const dynamic = "force-dynamic"

export default async function EditarAseguradoraPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerComponentClient({ cookies })

  // Obtener datos de la aseguradora
  const { data: aseguradora, error } = await supabase
    .from("personas")
    .select(`
      id,
      nombre,
      dni_cuit,
      telefono,
      email,
      domicilio,
      aseguradoras (
        id
      )
    `)
    .eq("id", params.id)
    .single()

  if (error || !aseguradora) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Editar Aseguradora</h1>
      <AseguradoraForm aseguradora={aseguradora} />
    </div>
  )
}
