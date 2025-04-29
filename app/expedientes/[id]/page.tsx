"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate, formatCurrency } from "@/lib/utils"
import { ArrowLeft, Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ExpedienteTareas } from "@/components/expedientes/expediente-tareas"
import { ExpedienteActividades } from "@/components/expedientes/expediente-actividades"

export default function ExpedienteDetalle({ params }: { params: { id: string } }) {
  const [expediente, setExpediente] = useState(null)
  const [tareas, setTareas] = useState([])
  const [actividades, setActividades] = useState([])
  const [loading, setLoading] = useState(true)
  const [nuevaActividad, setNuevaActividad] = useState(null)
  const [datosAdicionales, setDatosAdicionales] = useState<{
    fechaHecho?: string | null
    mecanicaHecho?: string | null
  }>({})
  const supabase = createClientComponentClient()

  // Función para cargar los datos del expediente
  useEffect(() => {
    async function cargarDatos() {
      try {
        setLoading(true)

        // Cargar expediente
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
            autos
          `)
          .eq("id", params.id)
          .single()

        if (expedienteError || !expedienteData) {
          console.error("Expediente no encontrado:", expedienteError?.message || "No existe")
          notFound()
        }

        // Obtener datos del juzgado si existe
        let juzgado = null
        if (expedienteData.juzgado_id) {
          const { data: juzgadoData } = await supabase
            .from("personas")
            .select("nombre")
            .eq("id", expedienteData.juzgado_id)
            .single()

          juzgado = juzgadoData
        }

        // Obtener estados del expediente
        const { data: estadosData } = await supabase
          .from("expediente_estados")
          .select(`
            estados_expediente (
              id,
              nombre,
              color
            )
          `)
          .eq("expediente_id", params.id)

        const estados = estadosData || []

        // Obtener personas relacionadas con el expediente
        const { data: personasData } = await supabase
          .from("expediente_personas")
          .select(`
            rol,
            personas (
              id,
              nombre
            )
          `)
          .eq("expediente_id", params.id)

        const personas = personasData || []

        // Cargar tareas
        const { data: tareasData, error: tareasError } = await supabase
          .from("tareas_expediente")
          .select("*")
          .eq("expediente_id", params.id)
          .eq("cumplida", false)
          .order("fecha_vencimiento", { ascending: true })

        if (tareasError) throw tareasError

        // Cargar actividades
        const { data: actividadesData, error: actividadesError } = await supabase
          .from("actividades_expediente")
          .select("*")
          .eq("expediente_id", params.id)
          .order("fecha", { ascending: false })

        if (actividadesError) throw actividadesError

        setExpediente({ ...expedienteData, juzgado, estados, personas })
        setTareas(tareasData || [])
        setActividades(actividadesData || [])
      } catch (error: any) {
        console.error("Error al cargar datos:", error.message || error)
        notFound()
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [params.id, supabase])

  // Cargar datos adicionales desde localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && params.id) {
      try {
        const storedData = localStorage.getItem(`expediente_${params.id}_datos_adicionales`)
        if (storedData) {
          setDatosAdicionales(JSON.parse(storedData))
        }
      } catch (error) {
        console.error("Error al cargar datos adicionales:", error)
      }
    }
  }, [params.id])

  // Función para manejar cuando se completa una tarea
  const handleTareaCompletada = (actividad) => {
    setNuevaActividad(actividad)
  }

  if (loading) {
    return <div>Cargando...</div>
  }

  if (!expediente) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h1 className="text-2xl font-bold">Error al cargar el expediente</h1>
        <p className="text-muted-foreground">No se pudo cargar la información del expediente.</p>
        <Button asChild>
          <Link href="/expedientes">Volver a la lista de expedientes</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/expedientes">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Volver</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Expediente {expediente.numero}</h1>
            {expediente.autos && <p className="text-muted-foreground">{expediente.autos}</p>}
          </div>
        </div>
        <Button asChild>
          <Link href={`/expedientes/${params.id}/editar`}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Número</p>
                  <p className="font-medium">{expediente.numero}</p>
                </div>
                {expediente.numero_judicial && (
                  <div>
                    <p className="text-sm text-muted-foreground">Número Judicial</p>
                    <p>{expediente.numero_judicial}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Inicio</p>
                  <p>{formatDate(expediente.fecha_inicio)}</p>
                </div>
                {expediente.fecha_inicio_judicial && (
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de Inicio Judicial</p>
                    <p>{formatDate(expediente.fecha_inicio_judicial)}</p>
                  </div>
                )}
                {datosAdicionales.fechaHecho && (
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha del Hecho</p>
                    <p>{formatDate(new Date(datosAdicionales.fechaHecho))}</p>
                  </div>
                )}
                {expediente.monto_total && (
                  <div>
                    <p className="text-sm text-muted-foreground">Monto Total</p>
                    <p>{formatCurrency(expediente.monto_total)}</p>
                  </div>
                )}
                {expediente.juzgado && (
                  <div>
                    <p className="text-sm text-muted-foreground">Juzgado</p>
                    <p>{expediente.juzgado.nombre}</p>
                  </div>
                )}
                {expediente.objeto && (
                  <div>
                    <p className="text-sm text-muted-foreground">Objeto</p>
                    <p>{expediente.objeto}</p>
                  </div>
                )}
              </div>

              {datosAdicionales.mecanicaHecho && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">Mecánica del Hecho</p>
                  <p className="whitespace-pre-wrap">{datosAdicionales.mecanicaHecho}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="h-fit">
            <CardHeader className="pb-2">
              <CardTitle>Estados</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex flex-wrap gap-2">
                {expediente.estados?.length === 0 ? (
                  <p className="text-muted-foreground">No hay estados asignados</p>
                ) : (
                  expediente.estados?.map((estado: any, index: number) => (
                    <Badge
                      key={index}
                      variant="outline"
                      style={{
                        backgroundColor: estado.estados_expediente?.color
                          ? `${estado.estados_expediente.color}20`
                          : undefined,
                        color: estado.estados_expediente?.color,
                        borderColor: estado.estados_expediente?.color,
                      }}
                    >
                      {estado.estados_expediente?.nombre || "Estado sin nombre"}
                    </Badge>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personas Relacionadas</CardTitle>
        </CardHeader>
        <CardContent>
          {expediente.personas?.length === 0 ? (
            <p className="text-muted-foreground">No hay personas relacionadas</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {expediente.personas?.map((relacion: any, index: number) => (
                <div key={index} className="border rounded-md p-4">
                  <p className="font-medium">{relacion.personas?.nombre || "Persona sin nombre"}</p>
                  <p className="text-sm text-muted-foreground">{relacion.rol || "Sin rol asignado"}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <ExpedienteTareas expedienteId={params.id} tareas={tareas} onTareaCompletada={handleTareaCompletada} />
        <ExpedienteActividades expedienteId={params.id} actividades={actividades} nuevaActividad={nuevaActividad} />
      </div>
    </div>
  )
}
