"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import { Checkbox } from "@/components/ui/checkbox"
import { formatDate } from "@/lib/utils"
import { Loader2, PlusCircle, CheckCircle, AlertCircle } from "lucide-react"

type Tarea = {
  id: number
  descripcion: string
  fecha_vencimiento: string
  cumplida: boolean
}

export function ExpedienteTareas({
  expedienteId,
  onTareaCompletada,
}: {
  expedienteId: string
  onTareaCompletada?: (actividad: any) => void
}) {
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nuevaTarea, setNuevaTarea] = useState("")
  const [fechaVencimiento, setFechaVencimiento] = useState<Date | undefined>(undefined)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [completando, setCompletando] = useState<number | null>(null)
  const supabase = createClientComponentClient()

  // Cargar tareas
  useEffect(() => {
    const cargarTareas = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("tareas_expediente")
          .select("*")
          .eq("expediente_id", expedienteId)
          .eq("cumplida", false)
          .order("fecha_vencimiento", { ascending: true })

        if (error) throw error
        setTareas(data || [])
      } catch (error: any) {
        console.error("Error al cargar tareas:", error)
        setError("Error al cargar las tareas. Por favor, intente nuevamente.")
      } finally {
        setLoading(false)
      }
    }

    cargarTareas()
  }, [expedienteId, supabase])

  // Agregar nueva tarea
  const agregarTarea = async () => {
    if (!nuevaTarea.trim() || !fechaVencimiento) {
      setError("Por favor, ingrese una descripción y fecha de vencimiento.")
      return
    }

    try {
      setEnviando(true)
      setError(null)

      const { data: tareaNueva, error } = await supabase
        .from("tareas_expediente")
        .insert({
          expediente_id: expedienteId,
          descripcion: nuevaTarea.trim(),
          fecha_vencimiento: fechaVencimiento.toISOString(),
          cumplida: false,
        })
        .select()
        .single()

      if (error) throw error

      // Registrar actividad
      const { data: actividad, error: errorActividad } = await supabase
        .from("actividades_expediente")
        .insert({
          expediente_id: expedienteId,
          descripcion: `Nueva tarea: ${nuevaTarea.trim()}`,
          fecha: new Date().toISOString(),
          automatica: true,
        })
        .select()
        .single()

      if (errorActividad) throw errorActividad

      // Actualizar estado local
      setTareas((prevTareas) => [...prevTareas, tareaNueva])
      setNuevaTarea("")
      setFechaVencimiento(undefined)
      setMostrarFormulario(false)

      // Notificar al componente padre
      if (onTareaCompletada && actividad) {
        onTareaCompletada(actividad)
      }
    } catch (error: any) {
      console.error("Error al agregar tarea:", error)
      setError("Error al agregar la tarea. Por favor, intente nuevamente.")
    } finally {
      setEnviando(false)
    }
  }

  // Completar tarea
  const completarTarea = async (tareaId: number) => {
    try {
      setCompletando(tareaId)
      setError(null)

      // Obtener la descripción de la tarea
      const tarea = tareas.find((t) => t.id === tareaId)
      if (!tarea) throw new Error("Tarea no encontrada")

      // Actualizar tarea
      const { error } = await supabase.from("tareas_expediente").update({ cumplida: true }).eq("id", tareaId)

      if (error) throw error

      // Registrar actividad
      const { data: actividad, error: errorActividad } = await supabase
        .from("actividades_expediente")
        .insert({
          expediente_id: expedienteId,
          descripcion: `Tarea cumplida: ${tarea.descripcion}`,
          fecha: new Date().toISOString(),
          automatica: true,
        })
        .select()
        .single()

      if (errorActividad) throw errorActividad

      // Actualizar estado local
      setTareas((prevTareas) => prevTareas.filter((t) => t.id !== tareaId))

      // Notificar al componente padre
      if (onTareaCompletada && actividad) {
        onTareaCompletada(actividad)
      }
    } catch (error: any) {
      console.error("Error al completar tarea:", error)
      setError("Error al completar la tarea. Por favor, intente nuevamente.")
    } finally {
      setCompletando(null)
    }
  }

  // Verificar si una tarea está vencida
  const estaVencida = (fecha: string) => {
    const fechaVencimiento = new Date(fecha)
    const hoy = new Date()
    return fechaVencimiento < hoy
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Tareas pendientes</CardTitle>
            <CardDescription>Gestiona las tareas pendientes del expediente</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            disabled={enviando}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Nueva tarea
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && <div className="bg-destructive/10 text-destructive text-sm p-2 rounded-md mb-4">{error}</div>}

        {mostrarFormulario && (
          <div className="space-y-4 mb-6 p-4 border rounded-md bg-muted/30">
            <div>
              <label htmlFor="descripcion-tarea" className="block text-sm font-medium mb-1">
                Descripción de la tarea
              </label>
              <Input
                id="descripcion-tarea"
                value={nuevaTarea}
                onChange={(e) => setNuevaTarea(e.target.value)}
                placeholder="Describir la tarea a realizar"
                disabled={enviando}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha de vencimiento</label>
              <DatePicker date={fechaVencimiento} setDate={setFechaVencimiento} disabled={enviando} />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMostrarFormulario(false)
                  setNuevaTarea("")
                  setFechaVencimiento(undefined)
                  setError(null)
                }}
                disabled={enviando}
              >
                Cancelar
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={agregarTarea}
                disabled={enviando || !nuevaTarea.trim() || !fechaVencimiento}
              >
                {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar tarea"}
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : tareas.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/70" />
            <p>No hay tareas pendientes para este expediente.</p>
            <p className="text-sm">Puedes agregar una nueva tarea usando el botón superior.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tareas.map((tarea) => {
              const vencida = estaVencida(tarea.fecha_vencimiento)
              return (
                <div
                  key={tarea.id}
                  className={`p-3 border rounded-md flex items-start justify-between ${
                    vencida ? "bg-destructive/5 border-destructive/20" : ""
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <Checkbox
                      checked={false}
                      onCheckedChange={() => completarTarea(tarea.id)}
                      disabled={completando === tarea.id}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{tarea.descripcion}</p>
                      <div className="flex items-center mt-1">
                        {vencida ? (
                          <div className="flex items-center text-xs text-destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Vencida: {formatDate(tarea.fecha_vencimiento)}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">Vence: {formatDate(tarea.fecha_vencimiento)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => completarTarea(tarea.id)}
                    disabled={completando === tarea.id}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {completando === tarea.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Completar
                      </>
                    )}
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
