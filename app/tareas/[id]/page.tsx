"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, CheckCircle, Clock, XCircle } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { TareaForm } from "@/components/tareas/tarea-form"

export default function TareaPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [tarea, setTarea] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    async function fetchTarea() {
      setLoading(true)
      setError(null)

      try {
        const { data, error: fetchError } = await supabase
          .from("tareas_expediente")
          .select(`
            id,
            descripcion,
            fecha_vencimiento,
            fecha_creacion,
            prioridad,
            cumplida,
            notas,
            expediente_id,
            expedientes (
              id,
              numero,
              expediente_personas (
                personas (
                  nombre
                )
              )
            )
          `)
          .eq("id", params.id)
          .single()

        if (fetchError) throw fetchError

        setTarea(data)
      } catch (err: any) {
        console.error("Error al cargar tarea:", err)
        setError(err.message || "Error al cargar la tarea")
      } finally {
        setLoading(false)
      }
    }

    fetchTarea()
  }, [supabase, params.id])

  // Función para marcar la tarea como cumplida/pendiente
  const toggleTareaStatus = async () => {
    try {
      const { error } = await supabase
        .from("tareas_expediente")
        .update({ cumplida: !tarea.cumplida })
        .eq("id", params.id)

      if (error) throw error

      // Actualizar el estado local
      setTarea({ ...tarea, cumplida: !tarea.cumplida })
    } catch (error) {
      console.error("Error al actualizar estado de la tarea:", error)
    }
  }

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
        <h2 className="text-xl font-semibold mb-2">Error al cargar la tarea</h2>
        <p>{error}</p>
        <Button className="mt-4" onClick={() => router.push("/tareas")}>
          Volver a tareas
        </Button>
      </div>
    )
  }

  if (!tarea) {
    return (
      <div className="rounded-md border p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Tarea no encontrada</h2>
        <p className="text-muted-foreground mb-4">La tarea solicitada no existe o ha sido eliminada.</p>
        <Button onClick={() => router.push("/tareas")}>Volver a tareas</Button>
      </div>
    )
  }

  // Obtener el cliente del expediente
  const clienteNombre = tarea.expedientes?.expediente_personas?.[0]?.personas?.nombre || "Sin cliente"

  // Determinar el color de la prioridad
  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case "alta":
        return "text-red-500 bg-red-50"
      case "media":
        return "text-amber-500 bg-amber-50"
      case "baja":
        return "text-green-500 bg-green-50"
      default:
        return "text-gray-500 bg-gray-50"
    }
  }

  // Verificar si la tarea está vencida
  const isVencida = tarea.fecha_vencimiento && new Date(tarea.fecha_vencimiento) < new Date() && !tarea.cumplida

  if (editMode) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setEditMode(false)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Editar Tarea</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Formulario de edición</CardTitle>
            <CardDescription>Actualiza la información de la tarea</CardDescription>
          </CardHeader>
          <CardContent>
            <TareaForm
              tareaId={params.id}
              initialData={tarea}
              onSuccess={() => {
                setEditMode(false)
                router.refresh()
              }}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Tarea</h1>
            <p className="text-muted-foreground">
              {tarea.cumplida ? (
                <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                  <CheckCircle className="mr-1 h-3 w-3" /> Cumplida
                </Badge>
              ) : isVencida ? (
                <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                  <XCircle className="mr-1 h-3 w-3" /> Vencida
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                  <Clock className="mr-1 h-3 w-3" /> Pendiente
                </Badge>
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={toggleTareaStatus}>
            {tarea.cumplida ? (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                Marcar como pendiente
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Marcar como cumplida
              </>
            )}
          </Button>
          <Button onClick={() => setEditMode(true)}>Editar tarea</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la tarea</CardTitle>
          <CardDescription>Detalles de la tarea y expediente asociado</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Descripción</h3>
                <p className="text-lg">{tarea.descripcion}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Expediente</h3>
                <p className="text-lg">
                  <Button
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => router.push(`/expedientes/${tarea.expediente_id}`)}
                  >
                    {tarea.expedientes?.numero} - {clienteNombre}
                  </Button>
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Prioridad</h3>
                <p className="text-lg">
                  <Badge variant="outline" className={getPrioridadColor(tarea.prioridad)}>
                    {tarea.prioridad.charAt(0).toUpperCase() + tarea.prioridad.slice(1)}
                  </Badge>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Fecha de creación</h3>
                <p className="text-lg">{formatDate(tarea.fecha_creacion)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Fecha de vencimiento</h3>
                <p className="text-lg">
                  {formatDate(tarea.fecha_vencimiento)}
                  {isVencida && (
                    <Badge variant="outline" className="ml-2 bg-red-50 text-red-600 border-red-200">
                      Vencida
                    </Badge>
                  )}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Estado</h3>
                <p className="text-lg">{tarea.cumplida ? "Cumplida" : "Pendiente"}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Notas</h3>
            <div className="rounded-md border p-4">
              {tarea.notas ? (
                <p className="whitespace-pre-wrap">{tarea.notas}</p>
              ) : (
                <p className="text-muted-foreground italic">Sin notas adicionales</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
