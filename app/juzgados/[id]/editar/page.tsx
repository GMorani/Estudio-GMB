import { notFound } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { JuzgadoForm } from "@/components/juzgados/juzgado-form"

// Marcar la página como dinámica
export const dynamic = "force-dynamic"

export default async function EditarJuzgadoPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })

  // Obtener datos del juzgado
  const { data: juzgado, error } = await supabase
    .from("personas")
    .select(`
      id,
      nombre,
      domicilio,
      telefono,
      email,
      juzgados (
        nombre_juez,
        nombre_secretario
      )
    `)
    .eq("id", params.id)
    .eq("tipo_id", 4) // Tipo juzgado
    .single()

  if (error || !juzgado) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Editar Juzgado</h1>
      <JuzgadoForm juzgado={juzgado} />
    </div>
  )
}
