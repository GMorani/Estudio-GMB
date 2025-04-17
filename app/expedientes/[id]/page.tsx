import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate, formatCurrency } from "@/lib/utils"
import { ArrowLeft, Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Marcar la página como dinámica
export const dynamic = "force-dynamic"

export default async function ExpedienteDetallePage({
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
        juzgados:personas(nombre)
      `)
      .eq("id", params.id)
      .single()

    if (expedienteError || !expediente) {
      console.error("Error al cargar expediente:", expedienteError)
      notFound()
    }

    // Obtener estados del expediente
    const { data: estados } = await supabase
      .from("expediente_estados")
      .select(`
        estados_expediente (
          id,
          nombre,
          color
        )
      `)
      .eq("expediente_id", params.id)

    // Obtener personas relacionadas con el expediente
    const { data: personas } = await supabase
      .from("expediente_personas")
      .select(`
        rol,
        personas (
          id,
          nombre,
          tipo_id
        )
      `)
      .eq("expediente_id", params.id)

    // Obtener actividades del expediente
    const { data: actividades } = await supabase
      .from("actividades_expediente")
      .select("*")
      .eq("expediente_id", params.id)
      .order("fecha", { ascending: false })
      .limit(10)

    // Obtener tareas del expediente
    const { data: tareas } = await supabase
      .from("tareas_expediente")
      .select("*")
      .eq("expediente_id", params.id)
      .order("fecha_vencimiento", { ascending: true })

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
            <h1 className="text-3xl font-bold">Expediente {expediente.numero}</h1>
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
                {expediente.juzgados && (
                  <div>
                    <p className="text-sm text-muted-foreground">Juzgado</p>
                    <p>{expediente.juzgados.nombre}</p>
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
                {estados?.length === 0 ? (
                  <p className="text-muted-foreground">No hay estados asignados</p>
                ) : (
                  estados?.map((estado, index) => (
                    <Badge
                      key={index}
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
            {personas?.length === 0 ? (
              <p className="text-muted-foreground">No hay personas relacionadas</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {personas?.map((relacion, index) => (
                  <div key={index} className="border rounded-md p-4">
                    <p className="font-medium">{relacion.personas.nombre}</p>
                    <p className="text-sm text-muted-foreground">{relacion.rol}</p>
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
              {actividades?.length === 0 ? (
                <p className="text-muted-foreground">No hay actividades registradas</p>
              ) : (
                <div className="space-y-4">
                  {actividades?.map((actividad, index) => (
                    <div key={index} className="border-b pb-2 last:border-0">
                      <p className="text-sm">{actividad.descripcion}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(actividad.fecha)}</p>
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
              {tareas?.length === 0 ? (
                <p className="text-muted-foreground">No hay tareas pendientes</p>
              ) : (
                <div className="space-y-4">
                  {tareas?.map((tarea, index) => (
                    <div
                      key={index}
                      className={`border rounded-md p-2 ${tarea.cumplida ? "opacity-60 line-through" : ""}`}
                    >
                      <p className="font-medium">{tarea.descripcion}</p>
                      <p className="text-xs text-muted-foreground">
                        Vencimiento: {formatDate(tarea.fecha_vencimiento)}
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
  } catch (error) {
    console.error("Error en ExpedienteDetallePage:", error)
    notFound()
  }
}
