import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Tipo para los expedientes
export type Expediente = {
  id: string
  numero: string
  fecha_inicio: string | null
  monto_total: number | null
  persona_nombre: string | null
  estados: {
    nombre: string
    color: string
  }[]
}

// Tipo para los filtros
export type FiltrosExpediente = {
  numero?: string | null
  personaId?: string | null
  estadoId?: string | null
  tipo?: string | null
  ordenarPor?: string
  ordenAscendente?: boolean
}

// Función para obtener expedientes con manejo de errores
export async function obtenerExpedientes(filtros: FiltrosExpediente): Promise<{
  data: Expediente[]
  error: string | null
}> {
  const supabase = createClientComponentClient()

  try {
    // Construir la consulta base
    let query = supabase.from("expedientes").select(`
      id,
      numero,
      fecha_inicio,
      monto_total,
      expediente_personas (
        personas (
          id,
          nombre
        )
      ),
      expediente_estados (
        estados_expediente (
          id,
          nombre,
          color
        )
      )
    `)

    // Aplicar filtros
    if (filtros.numero) {
      query = query.ilike("numero", `%${filtros.numero}%`)
    }

    if (filtros.personaId && filtros.personaId !== "all") {
      query = query.filter("expediente_personas.persona_id", "eq", filtros.personaId)
    }

    if (filtros.estadoId && filtros.estadoId !== "all") {
      query = query.filter("expediente_estados.estado_id", "eq", filtros.estadoId)
    }

    // Filtrar por tipo (activos, archivados, todos)
    if (filtros.tipo === "activos") {
      // Asumiendo que hay un estado "Archivado" con ID 5 (ajustar según tu base de datos)
      query = query.not("expediente_estados.estado_id", "eq", 5)
    } else if (filtros.tipo === "archivados") {
      query = query.filter("expediente_estados.estado_id", "eq", 5)
    }

    // Ordenar
    const ordenarPor = filtros.ordenarPor || "fecha_inicio"
    const ordenAscendente = filtros.ordenAscendente !== undefined ? filtros.ordenAscendente : false
    query = query.order(ordenarPor, { ascending: ordenAscendente })

    // Limitar resultados para evitar sobrecarga
    query = query.limit(50)

    const { data, error } = await query

    if (error) throw error

    // Transformar los datos para facilitar su uso
    const formattedData = data.map((exp) => {
      // Obtener el nombre de la primera persona asociada (generalmente el cliente principal)
      const personaNombre = exp.expediente_personas?.[0]?.personas?.nombre || "Sin persona"

      return {
        id: exp.id,
        numero: exp.numero,
        fecha_inicio: exp.fecha_inicio,
        monto_total: exp.monto_total,
        persona_nombre: personaNombre,
        estados: exp.expediente_estados.map((estado: any) => ({
          nombre: estado.estados_expediente.nombre,
          color: estado.estados_expediente.color,
        })),
      }
    })

    return { data: formattedData, error: null }
  } catch (error: any) {
    console.error("Error al cargar expedientes:", error)

    // Manejar específicamente el error de Too Many Requests
    if (error.message && error.message.includes("Too Many")) {
      return {
        data: [],
        error: "Demasiadas solicitudes. Por favor, espera un momento e intenta nuevamente.",
      }
    } else {
      return {
        data: [],
        error: "Error al cargar los expedientes. Por favor, intenta nuevamente.",
      }
    }
  }
}
