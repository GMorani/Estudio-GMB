import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { PeritoForm } from "@/components/peritos/perito-form"

// Marcar la página como dinámica
export const dynamic = "force-dynamic"

export default async function EditarPeritoPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerComponentClient({ cookies })

  // Obtener datos del perito
  const { data: perito, error } = await supabase
    .from("personas")
    .select(`
      id,
      nombre,
      dni_cuit,
      telefono,
      email,
      domicilio,
      peritos (
        id,
        especialidad
      )
    `)
    .eq("id", params.id)
    .single()

  if (error || !perito) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Editar Perito</h1>
      <PeritoForm perito={perito} />
    </div>
  )
}
