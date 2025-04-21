"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Calendar, FileText, MessageSquare, PencilLine } from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"
import { ExpedienteActividades } from "@/components/expedientes/expediente-actividades"
import { ExpedienteTareas } from "@/components/expedientes/expediente-tareas"

export default function ExpedientePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [expediente, setExpediente] = useState<any>(null)
  const [juzgado, setJuzgado] = useState<any>(null)
  const [estados, setEstados] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expedienteColumns, setExpedienteColumns] = useState<string[]>([])

  useEffect(() => {
    async function fetchExpediente() {
      setLoading(true)
      setError(null)

      try {
        // Primero, verificamos qué columnas existen en la tabla expedientes
        const { data: columnsData, error: columnsError } = await supabase.from("expedientes").select("*").limit(1)

        if (columnsError) throw columnsError

        // Guardamos las columnas disponibles
        if (columnsData && columnsData.length > 0) {
          setExpedienteColumns(Object.keys(columnsData[0]))
        }

        // Construimos la consulta dinámicamente basada en las columnas disponibles
        let query = "id, numero"

        // Añadimos columnas solo si existen
        if (expedienteColumns.includes("fecha_inicio")) query += ", fecha_inicio"
        if (expedienteColumns.includes("monto_total")) query += ", monto_total"
        if (expedienteColumns.includes("descripcion")) query += ", descripcion"
        if (expedienteColumns.includes("juzgado_id")) query += ", juzgado_id"

        // Consulta principal adaptativa
        const { data, error: fetchError } = await supabase
          .from("expedientes")
          .select(`
            ${query},
            expediente_personas (
              id,
              rol,
              persona_id,
              personas (
                id,
                nombre,
                dni_cuit,
                tipo_id
              )
            )
          `)
          .eq("id", params.id)
          .single()

        if (fetchError) throw fetchError

        setExpediente(data)

        // Consultas adicionales solo si es necesario
        if (data) {
          // Obtener los estados del expediente
          const { data: estadosData, error: estadosError } = await supabase
            .from("expediente_estados")
            .select(`
              id,
              estado_id,
              fecha_asignacion,
              estados_expediente (
                id,
                nombre,
                color
              )
            `)
            .eq("expediente_id", data.id)

          if (!estadosError && estadosData) {
            setEstados(estadosData)
          } else {
            console.warn("No se pudieron cargar los estados del expediente:", estadosError)
          }

          // Obtener información del juzgado si existe
          if (data.juzgado_id) {
            const { data: juzgadoData, error: juzgadoError } = await supabase
              .from("juzgados")
              .select("*")
              .eq("id", data.juzgado_id)
              .single()

            if (!juzgadoError) {
              setJuzgado(juzgadoData)
            } else {
              console.warn("No se pudo cargar la información del juzgado:", juzgadoError)
            }
          }
        }
      } catch (err: any) {
        console.error("Error al cargar expediente:", err)
        setError(err.message || "Error al cargar el expediente")
      } finally {
        setLoading(false)
      }
    }

    fetchExpediente()
  }, [supabase, params.id])

  // Función para obtener personas por rol
  const getPersonasByRol = (rol: string) => {
    if (!expediente?.expediente_personas) return []
    return expediente.expediente_personas.filter((ep: any) => ep.rol === rol).map((ep: any) => ep.personas)
  }

  // Obtener clientes, demandados y abogados
  const clientes = getPersonasByRol("cliente")
  const demandados = getPersonasByRol("demandado")
  const abogados = getPersonasByRol("abogado")

  // Obtener el estado actual (el más reciente)
  const estadoActual =
    estados.length > 0
      ? [...estados].sort(
          (a: any, b: any) => new Date(b.fecha_asignacion || 0).getTime() - new Date(a.fecha_asignacion || 0).getTime(),
        )[0]?.estados_expediente
      : null

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-8 text-center text-destructive">
        <h2 className="text-xl font-semibold mb-2">Error al cargar el expediente</h2>
        <p>{error}</p>
        <Button className="mt-4" onClick={() => router.push("/expedientes")}>
          Volver a expedientes
        </Button>
      </div>
    )
  }

  if (!expediente) {
    return (
      <div className="rounded-md border p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Expediente no encontrado</h2>
        <p className="text-muted-foreground mb-4">El expediente solicitado no existe o ha sido eliminado.</p>
        <Button onClick={() => router.push("/expedientes")}>Volver a expedientes</Button>
      </div>
    )
  }

  // Función para mostrar información del juzgado
  const renderJuzgadoInfo = () => {
    if (!expediente.juzgado_id) {
      return "No asignado"
    }

    if (juzgado) {
      // Mostrar la información disponible del juzgado
      // Primero verificamos si existe una columna 'nombre'
      if (juzgado.nombre) {
        return juzgado.nombre
      }
      // Si no hay nombre, mostramos otra información disponible
      else if (juzgado.descripcion) {
        return juzgado.descripcion
      }
      // Si no hay información descriptiva, mostramos el ID
      else {
        return `Juzgado ID: ${juzgado.id}`
      }
    }

    return `ID: ${expediente.juzgado_id}`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Expediente {expediente.numero}</h1>
            <p className="text-muted-foreground">
              {estadoActual && (
                <Badge
                  variant="outline"
                  style={{
                    backgroundColor: estadoActual.color ? `${estadoActual.color}20` : undefined,
                    color: estadoActual.color,
                    borderColor: estadoActual.color,
                  }}
                >
                  {estadoActual.nombre}
                </Badge>
              )}
            </p>
          </div>
        </div>
        <Button onClick={() => router.push(`/expedientes/${params.id}/editar`)}>Editar expediente</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información general</CardTitle>
          <CardDescription>Detalles principales del expediente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Número de expediente</h3>
                <p className="text-lg">{expediente.numero}</p>
              </div>

              {expedienteColumns.includes("fecha_inicio") && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Fecha de inicio</h3>
                  <p className="text-lg">{formatDate(expediente.fecha_inicio)}</p>
                </div>
              )}

              {expedienteColumns.includes("fecha_fin") && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Fecha de finalización</h3>
                  <p className="text-lg">{formatDate(expediente.fecha_fin) || "En curso"}</p>
                </div>
              )}

              {expedienteColumns.includes("monto_total") && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Monto total</h3>
                  <p className="text-lg">{formatCurrency(expediente.monto_total)}</p>
                </div>
              )}

              {expedienteColumns.includes("juzgado_id") && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Juzgado</h3>
                  <p className="text-lg">{renderJuzgadoInfo()}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Cliente(s)</h3>
                {clientes.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {clientes.map((cliente: any) => (
                      <li key={cliente.id} className="text-lg">
                        {cliente.nombre}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-lg">No hay clientes asignados</p>
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Demandado(s)</h3>
                {demandados.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {demandados.map((demandado: any) => (
                      <li key={demandado.id} className="text-lg">
                        {demandado.nombre}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-lg">No hay demandados asignados</p>
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Abogado(s)</h3>
                {abogados.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {abogados.map((abogado: any) => (
                      <li key={abogado.id} className="text-lg">
                        {abogado.nombre}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-lg">No hay abogados asignados</p>
                )}
              </div>
            </div>
          </div>

          {expedienteColumns.includes("descripcion") && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Descripción</h3>
              <div className="rounded-md border p-4">
                {expediente.descripcion ? (
                  <p className="whitespace-pre-wrap">{expediente.descripcion}</p>
                ) : (
                  <p className="text-muted-foreground italic">Sin descripción</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="actividades">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="actividades">
            <MessageSquare className="mr-2 h-4 w-4" />
            Actividades
          </TabsTrigger>
          <TabsTrigger value="tareas">
            <Calendar className="mr-2 h-4 w-4" />
            Tareas
          </TabsTrigger>
          <TabsTrigger value="documentos">
            <FileText className="mr-2 h-4 w-4" />
            Documentos
          </TabsTrigger>
        </TabsList>
        <TabsContent value="actividades" className="mt-4">
          <ExpedienteActividades expedienteId={params.id} />
        </TabsContent>
        <TabsContent value="tareas" className="mt-4">
          <ExpedienteTareas expedienteId={params.id} />
        </TabsContent>
        <TabsContent value="documentos" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Documentos</CardTitle>
              <CardDescription>Documentos asociados al expediente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <PencilLine className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Funcionalidad en desarrollo</h3>
                <p className="text-muted-foreground">La gestión de documentos estará disponible próximamente.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
