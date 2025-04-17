import { ExpedienteForm } from "@/components/expedientes/expediente-form"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

// Marcar la página como dinámica
export const dynamic = "force-dynamic"

export default async function NuevoExpedientePage() {
  const supabase = createServerComponentClient({ cookies })

  // Obtener datos necesarios para el formulario
  const { data: juzgados } = await supabase
    .from("personas")
    .select("id, nombre")
    .eq("tipo_id", 4) // Tipo juzgado
    .order("nombre")

  const { data: estados } = await supabase.from("estados_expediente").select("id, nombre, color").order("nombre")

  const { data: clientes } = await supabase
    .from("personas")
    .select("id, nombre")
    .eq("tipo_id", 1) // Tipo cliente
    .order("nombre")

  const { data: abogados } = await supabase
    .from("personas")
    .select("id, nombre")
    .eq("tipo_id", 2) // Tipo abogado
    .order("nombre")

  const { data: aseguradoras } = await supabase
    .from("personas")
    .select("id, nombre")
    .eq("tipo_id", 3) // Tipo aseguradora
    .order("nombre")

  const { data: mediadores } = await supabase
    .from("personas")
    .select("id, nombre")
    .eq("tipo_id", 5) // Tipo mediador
    .order("nombre")

  const { data: peritos } = await supabase
    .from("personas")
    .select("id, nombre")
    .eq("tipo_id", 6) // Tipo perito
    .order("nombre")

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Nuevo Expediente</h1>

      <ExpedienteForm
        juzgados={juzgados || []}
        estados={estados || []}
        clientes={clientes || []}
        abogados={abogados || []}
        aseguradoras={aseguradoras || []}
        mediadores={mediadores || []}
        peritos={peritos || []}
      />
    </div>
  )
}
