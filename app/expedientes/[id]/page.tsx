import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"
import { ArrowLeft, Calendar, FileText, Users, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatCurrency } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const dynamic = "force-dynamic"
export const revalidate = 0

async function getExpediente(id: string) {
  const supabase = createServerComponentClient({ cookies })

  try {
    // Primero verificamos si el expediente existe
    const { data: expedienteBasico, error: errorBasico } = await supabase
      .from("expedientes")
      .select("id, numero, fecha_inicio, monto_total")
      .eq("id", id)
      .single()

    if (errorBasico) {
      console.error("Error al verificar expediente:", errorBasico)
      return null
    }

    if (!expedienteBasico) {
      console.error("Expediente no encontrado")
      return null
    }

    // Obtenemos las personas relacionadas
    const { data: expedientePersonas, error: errorPersonas } = await supabase
      .from("expediente_personas")
      .select(`
        id,
        rol,
        persona_id,
        personas (
          id,
          nombre,
          tipo_id
        )
      `)
      .eq("expediente_id", id)

    if (errorPersonas) {
      console.error("Error al obtener personas:", errorPersonas)
    }

    // Obtenemos los estados con una consulta simplificada
    const { data: expedienteEstados, error: errorEstados } = await supabase
      .from("expediente_estados")
      .select(`
        id,
        estado_id,
        expediente_id,
        estados_expediente (
          id,
          nombre,
          color
        )
      `)
      .eq("expediente_id", id)
      .order("id", { ascending: false })

    if (errorEstados) {
      console.error("Error al obtener estados:", errorEstados)
    }

    // Combinamos todos los datos
    return {
      ...expedienteBasico,
      expediente_personas: expedientePersonas || [],
      expediente_estados: expedienteEstados || [],
    }
  } catch (error) {
    console.error("Error general al obtener expediente:", error)
    return null
  }
}

export default async function ExpedienteDetalle({ params }: { params: { id: string } }) {
  const expediente = await getExpediente(params.id)

  // Si no se encuentra el expediente, mostramos una página de error personalizada
  if (!expediente) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col items-center justify-center space-y-4">
          <h1 className="text-2xl font-bold">Expediente no encontrado</h1>
          <p>El expediente que estás buscando no existe o no tienes permisos para verlo.</p>
          <Button asChild>
            <Link href="/expedientes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Expedientes
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  // Organizar personas por rol
  const personasPorRol: Record<string, any[]> = {}
  expediente.expediente_personas.forEach((ep: any) => {
    const rol = ep.rol || "Sin rol"
    if (!personasPorRol[rol]) {
      personasPorRol[rol] = []
    }
    personasPorRol[rol].push(ep.personas)
  })

  // Ya no necesitamos ordenar los estados, ya que vienen ordenados de la consulta
  const estadosOrdenados = expediente.expediente_estados
  const estadoActual = estadosOrdenados.length > 0 ? estadosOrdenados[0].estados_expediente : null

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/expedientes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Expediente {expediente.numero}</h1>
          {estadoActual && (
            <Badge
              className="ml-2"
              style={{
                backgroundColor: estadoActual.color ? `${estadoActual.color}20` : undefined,
                color: estadoActual.color,
                borderColor: estadoActual.color,
              }}
            >
              {estadoActual.nombre}
            </Badge>
          )}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/expedientes/${params.id}/editar`}>Editar</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Número</p>
              <p>{expediente.numero}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fecha de Inicio</p>
              <p>{formatDate(expediente.fecha_inicio)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Monto Total</p>
              <p>{expediente.monto_total ? formatCurrency(expediente.monto_total) : "No especificado"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Personas Involucradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(personasPorRol).length === 0 ? (
              <p className="text-muted-foreground">No hay personas asociadas</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(personasPorRol).map(([rol, personas]) => (
                  <div key={rol}>
                    <p className="text-sm font-medium text-muted-foreground">{rol}</p>
                    <ul className="mt-1 space-y-1">
                      {personas.map((persona: any) => (
                        <li key={persona.id}>
                          <Link href={`/personas/${persona.id}`} className="hover:underline">
                            {persona.nombre}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Historial de Estados
          </CardTitle>
          <CardDescription>Seguimiento cronológico de los estados del expediente</CardDescription>
        </CardHeader>
        <CardContent>
          {estadosOrdenados.length === 0 ? (
            <p className="text-muted-foreground">No hay estados registrados</p>
          ) : (
            <div className="relative pl-6 border-l border-border">
              {estadosOrdenados.map((estado: any, index: number) => (
                <div key={estado.id} className="mb-4 relative">
                  <div className="absolute -left-[25px] mt-1 w-4 h-4 rounded-full bg-background border-2 border-primary"></div>
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <Badge
                        variant="outline"
                        style={{
                          backgroundColor: estado.estados_expediente.color
                            ? `${estado.estados_expediente.color}20`
                            : undefined,
                          color: estado.estados_expediente.color,
                          borderColor: estado.estados_expediente.color,
                        }}
                      >
                        {estado.estados_expediente.nombre}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Información adicional</AlertTitle>
        <AlertDescription>
          La información sobre juzgados y abogados asociados no está disponible en este momento.
        </AlertDescription>
      </Alert>
    </div>
  )
}
