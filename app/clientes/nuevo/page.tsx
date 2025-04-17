import { ClienteForm } from "@/components/clientes/cliente-form"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

// Marcar la página como dinámica
export const dynamic = "force-dynamic"

export default async function NuevoClientePage() {
  const supabase = createServerComponentClient({ cookies })

  // Obtener lista de clientes para el campo "referido"
  const { data: clientesReferidos } = await supabase
    .from("personas")
    .select("id, nombre")
    .eq("tipo_id", 1) // Asumiendo que tipo_id 1 es para clientes
    .order("nombre")

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Nuevo Cliente</h1>

      <ClienteForm clientesReferidos={clientesReferidos || []} />
    </div>
  )
}
