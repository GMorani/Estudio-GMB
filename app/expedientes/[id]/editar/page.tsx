import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { ExpedienteForm } from "@/components/expedientes/expediente-form"

// Marcar la página como dinámica
export const dynamic = "force-dynamic"

export default async function EditarExpedientePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerComponentClient({ cookies })

  try {
    // Obtener datos del expediente
    const { data: expediente, error: expedienteError } = await supabase
      .from("expedientes")
      .select(`
        id,
        numero,
        numero_judicial,
        fecha_inicio,
        fecha_inicio_judicial,
        monto_total,
        juzgado_id,
        expediente_estados (
          estado_id
        ),
        expediente_personas (
          persona_id,
          rol
        )
      `)
      .eq("id", params.id)
      .single()

    if (expedienteError || !expediente) {
      console.error("Error al cargar expediente:", expedienteError)
      notFound()
    }

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
        <h1 className="text-3xl font-bold">Editar Expediente</h1>

        <ExpedienteForm
          expediente={expediente}
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
  } catch (error) {
    console.error("Error en EditarExpedientePage:", error)
    notFound()
  }
}
