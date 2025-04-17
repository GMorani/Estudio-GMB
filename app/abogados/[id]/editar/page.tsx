import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { AbogadoForm } from "@/components/abogados/abogado-form"

// Marcar la página como dinámica
export const dynamic = "force-dynamic"

export default async function EditarAbogadoPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerComponentClient({ cookies })

  // Obtener datos del abogado
  const { data: abogado, error } = await supabase
    .from("personas")
    .select(`
    id,
    nombre,
    dni_cuit,
    telefono,
    email,
    domicilio,
    abogados (
      id
    )
  `)
    .eq("id", params.id)
    .single()

  if (error || !abogado) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Editar Abogado</h1>
      <AbogadoForm abogado={abogado} />
    </div>
  )
}
