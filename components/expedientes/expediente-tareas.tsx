"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import { useToast } from "@/components/ui/use-toast"
import { formatDate } from "@/lib/utils"
import { PlusCircle, Loader2 } from "lucide-react"

type Tarea = {
  id: number
  descripcion: string
  fecha_vencimiento: string
  cumplida: boolean
}

type ExpedienteTareasProps = {
  expedienteId: string
  tareas: Tarea[]
}

export function ExpedienteTareas({ expedienteId, tareas }: ExpedienteTareasProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const [tareasState, setTareasState] = useState<Tarea[]>(tareas)
  const [isLoading, setIsLoading] = useState<Record<number, boolean>>({})
  const [isCreating, setIsCreating] = useState(false)
  const [nuevaTarea, setNuevaTarea] = useState({
    descripcion: "",
    fecha_vencimiento: new Date(),
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Función para marcar una tarea como completada
  const completarTarea = async (tareaId: number, descripcion: string) => {
    try {
      setIsLoading((prev) => ({ ...prev, [tareaId]: true }))

      // 1. Actualizar la tarea a cumplida
      const { error: updateError } = await supabase
        .from("tareas_expediente")
        .update({ cumplida: true })
        .eq("id", tareaId)

      if (updateError) throw updateError

      // 2. Registrar la actividad
      const { error: actividadError } = await supabase.from("actividades_expediente").insert({
        expediente_id: expedienteId,
        descripcion: `Tarea cumplida - ${descripcion}`,
        fecha: new Date().toISOString(),
        automatica: true,
      })

      if (actividadError) throw actividadError

      // 3. Actualizar el estado local
      setTareasState((prevTareas) => prevTareas.filter((tarea) => tarea.id !== tareaId))

      toast({
        title: "Tarea completada",
        description: "La tarea ha sido marcada como completada.",
      })
    } catch (error) {
      console.error("Error al completar tarea:", error)
      toast({
        title: "Error",
        description: "No se pudo completar la tarea. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading((prev) => ({ ...prev, [tareaId]: false }))
      router.refresh()
    }
  }

  // Función para crear una nueva tarea
  const crearTarea = async () => {
    if (!nuevaTarea.descripcion.trim()) {
      toast({
        title: "Error",
        description: "La descripción de la tarea es obligatoria.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const { data, error } = await supabase
        .from("tareas_expediente")
        .insert({
          expediente_id: expedienteId,
          descripcion: nuevaTarea.descripcion,
          fecha_vencimiento: nuevaTarea.fecha_vencimiento.toISOString(),
          cumplida: false,
        })
        .select()
        .single()

      if (error) throw error

      // Actualizar el estado local
      setTareasState((prevTareas) => [...prevTareas, data])

      // Registrar la actividad
      await supabase.from("actividades_expediente").insert({
        expediente_id: expedienteId,
        descripcion: `Nueva tarea creada - ${nuevaTarea.descripcion}`,
        fecha: new Date().toISOString(),
        automatica: true,
      })

      // Limpiar el formulario
      setNuevaTarea({
        descripcion: "",
        fecha_vencimiento: new Date(),
      })
      setIsCreating(false)

      toast({
        title: "Tarea creada",
        description: "La tarea ha sido creada correctamente.",
      })
    } catch (error) {
      console.error("Error al crear tarea:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la tarea. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      router.refresh()
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tareas Pendientes</CardTitle>
        {!isCreating && (
          <Button variant="outline" size="sm" onClick={() => setIsCreating(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Nueva Tarea
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isCreating && (
          <div className="border rounded-md p-4 space-y-4">
            <h3 className="font-medium">Nueva Tarea</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción</label>
              <Input
                value={nuevaTarea.descripcion}
                onChange={(e) => setNuevaTarea({ ...nuevaTarea, descripcion: e.target.value })}
                placeholder="Describir la tarea..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha de vencimiento</label>
              <DatePicker
                date={nuevaTarea.fecha_vencimiento}
                setDate={(date) => setNuevaTarea({ ...nuevaTarea, fecha_vencimiento: date })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancelar
              </Button>
              <Button onClick={crearTarea} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Tarea"
                )}
              </Button>
            </div>
          </div>
        )}

        {tareasState.length === 0 && !isCreating ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No hay tareas pendientes para este expediente.</p>
            <Button variant="link" onClick={() => setIsCreating(true)}>
              Crear una nueva tarea
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {tareasState.map((tarea) => {
              // Calcular si la tarea está vencida
              const fechaVencimiento = new Date(tarea.fecha_vencimiento)
              const hoy = new Date()
              const vencida = fechaVencimiento < hoy && !tarea.cumplida

              return (
                <div
                  key={tarea.id}
                  className={`flex items-start gap-3 p-3 border rounded-md ${
                    vencida ? "border-destructive/50 bg-destructive/5" : ""
                  }`}
                >
                  <Checkbox
                    checked={tarea.cumplida}
                    disabled={isLoading[tarea.id]}
                    onCheckedChange={() => completarTarea(tarea.id, tarea.descripcion)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{tarea.descripcion}</p>
                    <p className={`text-sm ${vencida ? "text-destructive" : "text-muted-foreground"}`}>
                      Vencimiento: {formatDate(tarea.fecha_vencimiento)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isLoading[tarea.id]}
                    onClick={() => completarTarea(tarea.id, tarea.descripcion)}
                  >
                    {isLoading[tarea.id] ? "Procesando..." : "Completar"}
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
