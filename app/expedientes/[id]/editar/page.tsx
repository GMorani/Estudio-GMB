"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { notFound, redirect } from "next/navigation"
import { ExpedienteForm } from "@/components/expedientes/expediente-form"

// Función para verificar si un ID es un UUID válido
function isValidUUID(id: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

export default function EditarExpedientePage({ params }: { params: { id: string } }) {
  // Redirección inmediata si el ID es "nuevo"
  if (params.id === "nuevo") {
    redirect("/expedientes/nuevo")
  }

  // Validación de UUID
  if (!isValidUUID(params.id)) {
    notFound()
  }

  const [expediente, setExpediente] = useState(null)
  const [juzgados, setJuzgados] = useState([])
  const [estados, setEstados] = useState([])
  const [clientes, setClientes] = useState([])
  const [abogados, setAbogados] = useState([])
  const [aseguradoras, setAseguradoras] = useState([])
  const [mediadores, setMediadores] = useState([])
  const [peritos, setPeritos] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function cargarDatos() {
      try {
        setLoading(true)

        // Cargar expediente con todos los campos, incluyendo fecha_hecho y mecanica_hecho
        const { data: expedienteData, error: expedienteError } = await supabase
          .from("expedientes")
          .select(`
            id,
            numero,
            numero_judicial,
            fecha_inicio,
            fecha_inicio_judicial,
            monto_total,
            juzgado_id,
            objeto,
            autos,
            fecha_hecho,
            mecanica_hecho,
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

        if (expedienteError) {
          console.error("Error al cargar expediente:", expedienteError)
          notFound()
          return
        }

        // Cargar juzgados
        const { data: juzgadosData, error: juzgadosError } = await supabase
          .from("personas")
          .select("id, nombre")
          .eq("tipo_id", 4) // Tipo juzgado

        if (juzgadosError) throw juzgadosError

        // Cargar estados
        const { data: estadosData, error: estadosError } = await supabase
          .from("estados_expediente")
          .select("id, nombre, color")

        if (estadosError) throw estadosError

        // Cargar clientes
        const { data: clientesData, error: clientesError } = await supabase
          .from("personas")
          .select("id, nombre")
          .eq("tipo_id", 1) // Tipo cliente

        if (clientesError) throw clientesError

        // Cargar abogados
        const { data: abogadosData, error: abogadosError } = await supabase
          .from("personas")
          .select("id, nombre")
          .eq("tipo_id", 2) // Tipo abogado

        if (abogadosError) throw abogadosError

        // Cargar aseguradoras
        const { data: aseguradorasData, error: aseguradorasError } = await supabase
          .from("personas")
          .select("id, nombre")
          .eq("tipo_id", 3) // Tipo aseguradora

        if (aseguradorasError) throw aseguradorasError

        // Cargar mediadores
        const { data: mediadoresData, error: mediadoresError } = await supabase
          .from("personas")
          .select("id, nombre")
          .eq("tipo_id", 5) // Tipo mediador

        if (mediadoresError) throw mediadoresError

        // Cargar peritos
        const { data: peritosData, error: peritosError } = await supabase
          .from("personas")
          .select("id, nombre")
          .eq("tipo_id", 6) // Tipo perito

        if (peritosError) throw peritosError

        setExpediente(expedienteData)
        setJuzgados(juzgadosData || [])
        setEstados(estadosData || [])
        setClientes(clientesData || [])
        setAbogados(abogadosData || [])
        setAseguradoras(aseguradorasData || [])
        setMediadores(mediadoresData || [])
        setPeritos(peritosData || [])
      } catch (error) {
        console.error("Error al cargar datos:", error)
        notFound()
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [params.id, supabase])

  if (loading) {
    return <div>Cargando...</div>
  }

  if (!expediente) {
    return <div>Expediente no encontrado</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editar Expediente</h1>
        <p className="text-muted-foreground">Actualice la información del expediente</p>
      </div>

      <ExpedienteForm
        expediente={expediente}
        juzgados={juzgados}
        estados={estados}
        clientes={clientes}
        abogados={abogados}
        aseguradoras={aseguradoras}
        mediadores={mediadores}
        peritos={peritos}
      />
    </div>
  )
}
