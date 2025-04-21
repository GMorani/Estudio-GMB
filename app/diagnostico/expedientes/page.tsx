"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/utils"
import { AlertCircle, ArrowRight, CheckCircle, Clock, FileText } from "lucide-react"

export default function DiagnosticoExpedientesPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)
  const [expedientesSinActividad, setExpedientesSinActividad] = useState<any[]>([])
  const [expedientesSinTareas, setExpedientesSinTareas] = useState<any[]>([])
  const [expedientesConTareasVencidas, setExpedientesConTareasVencidas] = useState<any[]>([])
  const [expedientesSinCliente, setExpedientesSinCliente] = useState<any[]>([])

  useEffect(() => {
    async function cargarDiagnostico() {
      setLoading(true)
      try {
        // 1. Expedientes sin actividad en los últimos 30 días
        const treintaDiasAtras = new Date()
        treintaDiasAtras.setDate(treintaDiasAtras.getDate() - 30)

        const { data: expedientes } = await supabase
          .from("expedientes")
          .select(`
            id,
            numero,
            fecha_inicio,
            expediente_estados (
              estados_expediente (
                id,
                nombre,
                color
              )
            ),
            actividades_expediente (
              id,
              fecha
            )
          `)
          .not("expediente_estados.estados_expediente.nombre", "eq", "Archivado")

        if (expedientes) {
          // Filtrar expedientes sin actividad reciente
          const sinActividad = expedientes.filter((exp) => {
            const actividades = exp.actividades_expediente || []
            if (actividades.length === 0) return true

            // Ordenar actividades por fecha (más reciente primero)
            const actividadesOrdenadas = [...actividades].sort(
              (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
            )

            // Verificar si la actividad más reciente es anterior a 30 días
            const ultimaActividad = actividadesOrdenadas[0]
            return new Date(ultimaActividad.fecha) < treintaDiasAtras
          })

          setExpedientesSinActividad(sinActividad)
        }

        // 2. Expedientes sin tareas pendientes
        const { data: expedientesTareas } = await supabase
          .from("expedientes")
          .select(`
            id,
            numero,
            fecha_inicio,
            expediente_estados (
              estados_expediente (
                id,
                nombre,
                color
              )
            ),
            tareas_expediente (
              id,
              cumplida
            )
          `)
          .not("expediente_estados.estados_expediente.nombre", "eq", "Archivado")

        if (expedientesTareas) {
          // Filtrar expedientes sin tareas o con todas las tareas cumplidas
          const sinTareasPendientes = expedientesTareas.filter((exp) => {
            const tareas = exp.tareas_expediente || []
            if (tareas.length === 0) return true

            // Verificar si todas las tareas están cumplidas
            return tareas.every((tarea) => tarea.cumplida)
          })

          setExpedientesSinTareas(sinTareasPendientes)
        }

        // 3. Expedientes con tareas vencidas
        const hoy = new Date()
        const { data: tareasVencidas } = await supabase
          .from("tareas_expediente")
          .select(`
            id,
            descripcion,
            fecha_vencimiento,
            expediente_id,
            expedientes (
              id,
              numero,
              fecha_inicio,
              expediente_estados (
                estados_expediente (
                  id,
                  nombre,
                  color
                )
              )
            )
          `)
          .eq("cumplida", false)
          .lt("fecha_vencimiento", hoy.toISOString())
          .not("expedientes.expediente_estados.estados_expediente.nombre", "eq", "Archivado")

        if (tareasVencidas) {
          // Agrupar por expediente
          const expedientesMap = new Map()

          tareasVencidas.forEach((tarea) => {
            const expedienteId = tarea.expediente_id
            if (!expedientesMap.has(expedienteId)) {
              expedientesMap.set(expedienteId, {
                ...tarea.expedientes,
                tareas_vencidas: [],
              })
            }

            const expediente = expedientesMap.get(expedienteId)
            expediente.tareas_vencidas.push({
              id: tarea.id,
              descripcion: tarea.descripcion,
              fecha_vencimiento: tarea.fecha_vencimiento,
            })
          })

          setExpedientesConTareasVencidas(Array.from(expedientesMap.values()))
        }

        // 4. Expedientes sin cliente asignado
        const { data: sinCliente } = await supabase
          .from("expedientes")
          .select(`
            id,
            numero,
            fecha_inicio,
            expediente_estados (
              estados_expediente (
                id,
                nombre,
                color
              )
            ),
            expediente_personas (
              id
            )
          `)
          .not("expediente_estados.estados_expediente.nombre", "eq", "Archivado")

        if (sinCliente) {
          // Filtrar expedientes sin personas asociadas
          const expedientesSinPersonas = sinCliente.filter((exp) => {
            const personas = exp.expediente_personas || []
            return personas.length === 0
          })

          setExpedientesSinCliente(expedientesSinPersonas)
        }
      } catch (error) {
        console.error("Error al cargar diagnóstico:", error)
      } finally {
        setLoading(false)
      }
    }

    cargarDiagnostico()
  }, [supabase])

  const renderExpedienteCard = (expediente: any, mensaje: string, icono: any) => {
    const estado = expediente.expediente_estados?.[0]?.estados_expediente || null

    return (
      <Card key={expediente.id} className="mb-3">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">{expediente.numero}</h3>
              <p className="text-sm text-muted-foreground">
                {icono}
                <span className="ml-1">{mensaje}</span>
              </p>
              <p className="text-xs text-muted-foreground">Inicio: {formatDate(expediente.fecha_inicio)}</p>
            </div>
            <div className="flex items-center gap-2">
              {estado && (
                <span
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: estado.color ? `${estado.color}20` : undefined,
                    color: estado.color,
                    borderColor: estado.color,
                  }}
                >
                  {estado.nombre}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="ml-2"
                onClick={() => router.push(`/expedientes/${expediente.id}`)}
              >
                Ver <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Diagnóstico de Expedientes</h1>
        <p className="text-muted-foreground">Identifica expedientes que requieren atención o seguimiento.</p>
      </div>

      <Tabs defaultValue="sin-actividad">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sin-actividad">
            Sin actividad reciente
            {!loading && (
              <span className="ml-2 text-xs bg-muted rounded-full px-2">{expedientesSinActividad.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="sin-tareas">
            Sin tareas pendientes
            {!loading && <span className="ml-2 text-xs bg-muted rounded-full px-2">{expedientesSinTareas.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="tareas-vencidas">
            Con tareas vencidas
            {!loading && (
              <span className="ml-2 text-xs bg-muted rounded-full px-2">{expedientesConTareasVencidas.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="sin-cliente">
            Sin cliente asignado
            {!loading && (
              <span className="ml-2 text-xs bg-muted rounded-full px-2">{expedientesSinCliente.length}</span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sin-actividad" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Expedientes sin actividad reciente</CardTitle>
              <CardDescription>Expedientes que no han tenido actividad en los últimos 30 días.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="mb-3">
                      <Skeleton className="h-24 w-full" />
                    </div>
                  ))
              ) : expedientesSinActividad.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-medium">¡Todos los expedientes tienen actividad reciente!</h3>
                  <p className="text-muted-foreground">No hay expedientes sin actividad en los últimos 30 días.</p>
                </div>
              ) : (
                expedientesSinActividad.map((expediente) =>
                  renderExpedienteCard(
                    expediente,
                    "Sin actividad en los últimos 30 días",
                    <Clock className="inline h-3 w-3" />,
                  ),
                )
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sin-tareas" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Expedientes sin tareas pendientes</CardTitle>
              <CardDescription>Expedientes que no tienen tareas pendientes asignadas.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="mb-3">
                      <Skeleton className="h-24 w-full" />
                    </div>
                  ))
              ) : expedientesSinTareas.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-medium">¡Todos los expedientes tienen tareas asignadas!</h3>
                  <p className="text-muted-foreground">No hay expedientes sin tareas pendientes.</p>
                </div>
              ) : (
                expedientesSinTareas.map((expediente) =>
                  renderExpedienteCard(
                    expediente,
                    "No tiene tareas pendientes asignadas",
                    <FileText className="inline h-3 w-3" />,
                  ),
                )
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tareas-vencidas" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Expedientes con tareas vencidas</CardTitle>
              <CardDescription>
                Expedientes que tienen tareas pendientes con fecha de vencimiento pasada.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="mb-3">
                      <Skeleton className="h-24 w-full" />
                    </div>
                  ))
              ) : expedientesConTareasVencidas.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-medium">¡No hay tareas vencidas!</h3>
                  <p className="text-muted-foreground">Todos los expedientes tienen sus tareas al día.</p>
                </div>
              ) : (
                expedientesConTareasVencidas.map((expediente) =>
                  renderExpedienteCard(
                    expediente,
                    `${expediente.tareas_vencidas.length} tarea(s) vencida(s)`,
                    <AlertCircle className="inline h-3 w-3 text-destructive" />,
                  ),
                )
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sin-cliente" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Expedientes sin cliente asignado</CardTitle>
              <CardDescription>Expedientes que no tienen ningún cliente o persona asociada.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="mb-3">
                      <Skeleton className="h-24 w-full" />
                    </div>
                  ))
              ) : expedientesSinCliente.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-medium">¡Todos los expedientes tienen cliente asignado!</h3>
                  <p className="text-muted-foreground">No hay expedientes sin cliente o persona asociada.</p>
                </div>
              ) : (
                expedientesSinCliente.map((expediente) =>
                  renderExpedienteCard(
                    expediente,
                    "No tiene cliente o persona asociada",
                    <AlertCircle className="inline h-3 w-3 text-amber-500" />,
                  ),
                )
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
