import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { ClienteForm } from "@/components/clientes/cliente-form"

// Marcar la página como dinámica
export const dynamic = "force-dynamic"

export default async function EditarClientePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerComponentClient({ cookies })

  // Obtener datos del cliente
  const { data: cliente, error } = await supabase
    .from("personas")
    .select(`
      id,
      nombre,
      dni_cuit,
      telefono,
      email,
      domicilio,
      clientes (
        referido
      ),
      vehiculos (
        id,
        marca,
        modelo,
        anio,
        dominio
      )
    `)
    .eq("id", params.id)
    .single()

  if (error || !cliente) {
    notFound()
  }

  // Obtener lista de clientes para el campo "referido"
  const { data: clientesReferidos } = await supabase
    .from("personas")
    .select("id, nombre")
    .eq("tipo_id", 1) // Asumiendo que tipo_id 1 es para clientes
    .neq("id", params.id) // Excluir el cliente actual
    .order("nombre")

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Editar Cliente</h1>

      <ClienteForm cliente={cliente} clientesReferidos={clientesReferidos || []} />
    </div>
  )
}
