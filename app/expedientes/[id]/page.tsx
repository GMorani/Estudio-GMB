import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate, formatCurrency } from "@/lib/utils"
import { ArrowLeft, Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Marcar la página como dinámica para asegurar que siempre se renderice en el servidor
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ExpedienteDetallePage({
  params,
}: {
  params: { id: string }
}) {
  // Verificar que el ID es válido
  if (!params.id) {
    console.error("ID de expediente no proporcionado")
    notFound()
  }

  console.log("Intentando cargar expediente con ID:", params.id)

  const supabase = createServerComponentClient({ cookies })

  try {
    // Primero verificar si el expediente existe
    const { data: expedienteExiste, error: errorExiste } = await supabase
      .from("expedientes")
      .select("id")
      .eq("id", params.id)
      .single()

    if (errorExiste || !expedienteExiste) {
      console.error("Expediente no encontrado:", errorExiste?.message || "No existe")
      notFound()
    }

    // Obtener datos completos del expediente
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
        objeto,
        autos
      `)
      .eq("id", params.id)
      .single()

    if (expedienteError || !expediente) {
      console.error("Error al cargar datos del expediente:", expedienteError?.message || "No hay datos")
      notFound()
    }

    // Obtener datos del juzgado si existe
    let juzgado = null
    if (expediente.juzgado_id) {
      const { data: juzgadoData } = await supabase
        .from("personas")
        .select("nombre")
        .eq("id", expediente.juzgado_id)
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

    // Obtener actividades del expediente
    const { data: actividadesData } = await supabase
      .from("actividades_expediente")
      .select("*")
      .eq("expediente_id", params.id)
      .order("fecha", { ascending: false })
      .limit(10)

    const actividades = actividadesData || []

    // Obtener tareas del expediente
    const { data: tareasData } = await supabase
      .from("tareas_expediente")
      .select("*")
      .eq("expediente_id", params.id)
      .order("fecha_vencimiento", { ascending: true })

    const tareas = tareasData || []

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
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
                {expediente.monto_total && (
                  <div>
                    <p className="text-sm text-muted-foreground">Monto Total</p>
                    <p>{formatCurrency(expediente.monto_total)}</p>
                  </div>
                )}
                {juzgado && (
                  <div>
                    <p className="text-sm text-muted-foreground">Juzgado</p>
                    <p>{juzgado.nombre}</p>
                  </div>
                )}
                {expediente.objeto && (
                  <div>
                    <p className="text-sm text-muted-foreground">Objeto</p>
                    <p>{expediente.objeto}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {estados.length === 0 ? (
                  <p className="text-muted-foreground">No hay estados asignados</p>
                ) : (
                  estados.map((estado, index) => (
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

        <Card>
          <CardHeader>
            <CardTitle>Personas Relacionadas</CardTitle>
          </CardHeader>
          <CardContent>
            {personas.length === 0 ? (
              <p className="text-muted-foreground">No hay personas relacionadas</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {personas.map((relacion, index) => (
                  <div key={index} className="border rounded-md p-4">
                    <p className="font-medium">{relacion.personas?.nombre || "Persona sin nombre"}</p>
                    <p className="text-sm text-muted-foreground">{relacion.rol || "Sin rol asignado"}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Actividades Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              {actividades.length === 0 ? (
                <p className="text-muted-foreground">No hay actividades registradas</p>
              ) : (
                <div className="space-y-4">
                  {actividades.map((actividad, index) => (
                    <div key={index} className="border-b pb-2 last:border-0">
                      <p className="text-sm">{actividad.descripcion || "Sin descripción"}</p>
                      <p className="text-xs text-muted-foreground">
                        {actividad.fecha ? formatDate(actividad.fecha) : "Fecha no disponible"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tareas Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              {tareas.length === 0 ? (
                <p className="text-muted-foreground">No hay tareas pendientes</p>
              ) : (
                <div className="space-y-4">
                  {tareas.map((tarea, index) => (
                    <div
                      key={index}
                      className={`border rounded-md p-2 ${tarea.cumplida ? "opacity-60 line-through" : ""}`}
                    >
                      <p className="font-medium">{tarea.descripcion || "Sin descripción"}</p>
                      <p className="text-xs text-muted-foreground">
                        Vencimiento: {tarea.fecha_vencimiento ? formatDate(tarea.fecha_vencimiento) : "No especificado"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  } catch (error: any) {
    console.error("Error general en ExpedienteDetallePage:", error.message || error)
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
}
