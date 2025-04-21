"use client"

import { useState, useEffect, useRef } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { formatDate } from "@/lib/utils"
import { Loader2, PlusCircle, Pencil, Trash2, Check, X } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type Actividad = {
  id: number
  descripcion: string
  fecha: string
  automatica: boolean
}

export function ExpedienteActividades({
  expedienteId,
  nuevaActividad,
}: {
  expedienteId: string
  nuevaActividad?: any
}) {
  const [actividades, setActividades] = useState<Actividad[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nuevaDescripcion, setNuevaDescripcion] = useState("")
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [mostrarTodas, setMostrarTodas] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [editando, setEditando] = useState<number | null>(null)
  const [descripcionEditada, setDescripcionEditada] = useState("")
  const [eliminando, setEliminando] = useState<number | null>(null)
  const supabase = createClientComponentClient()
  const prevNuevaActividadRef = useRef<any>()

  // Cargar actividades
  useEffect(() => {
    const cargarActividades = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("actividades_expediente")
          .select("*")
          .eq("expediente_id", expedienteId)
          .order("fecha", { ascending: false })

        if (error) throw error

        // Filtrar actividades que contengan "Expediente actualizado"
        const actividadesFiltradas = data.filter(
          (actividad) => !actividad.descripcion.includes("Expediente actualizado"),
        )
        setActividades(actividadesFiltradas || [])
      } catch (error: any) {
        console.error("Error al cargar actividades:", error)
        setError("Error al cargar las actividades. Por favor, intente nuevamente.")
      } finally {
        setLoading(false)
      }
    }

    cargarActividades()
  }, [expedienteId, supabase])

  // Detectar nueva actividad desde props
  useEffect(() => {
    if (nuevaActividad && (!prevNuevaActividadRef.current || prevNuevaActividadRef.current.id !== nuevaActividad.id)) {
      // Verificar que no contenga "Expediente actualizado"
      if (!nuevaActividad.descripcion.includes("Expediente actualizado")) {
        setActividades((prevActividades) => [nuevaActividad, ...prevActividades])
      }
      prevNuevaActividadRef.current = nuevaActividad
    }
  }, [nuevaActividad])

  // Agregar nueva actividad
  const agregarActividad = async () => {
    if (!nuevaDescripcion.trim()) {
      setError("Por favor, ingrese una descripción para la actividad.")
      return
    }

    try {
      setEnviando(true)
      setError(null)

      const { data, error } = await supabase
        .from("actividades_expediente")
        .insert({
          expediente_id: expedienteId,
          descripcion: nuevaDescripcion.trim(),
          fecha: new Date().toISOString(),
          automatica: false,
        })
        .select()
        .single()

      if (error) throw error

      // Actualizar estado local
      setActividades((prevActividades) => [data, ...prevActividades])
      setNuevaDescripcion("")
      setMostrarFormulario(false)
    } catch (error: any) {
      console.error("Error al agregar actividad:", error)
      setError("Error al agregar la actividad. Por favor, intente nuevamente.")
    } finally {
      setEnviando(false)
    }
  }

  // Editar actividad
  const iniciarEdicion = (actividad: Actividad) => {
    setEditando(actividad.id)
    setDescripcionEditada(actividad.descripcion)
  }

  const cancelarEdicion = () => {
    setEditando(null)
    setDescripcionEditada("")
  }

  const guardarEdicion = async (actividadId: number) => {
    if (!descripcionEditada.trim()) {
      setError("La descripción no puede estar vacía.")
      return
    }

    try {
      setEnviando(true)
      setError(null)

      const { error } = await supabase
        .from("actividades_expediente")
        .update({ descripcion: descripcionEditada.trim() })
        .eq("id", actividadId)

      if (error) throw error

      // Actualizar estado local
      setActividades((prevActividades) =>
        prevActividades.map((act) =>
          act.id === actividadId ? { ...act, descripcion: descripcionEditada.trim() } : act,
        ),
      )
      setEditando(null)
      setDescripcionEditada("")
    } catch (error: any) {
      console.error("Error al editar actividad:", error)
      setError("Error al editar la actividad. Por favor, intente nuevamente.")
    } finally {
      setEnviando(false)
    }
  }

  // Eliminar actividad
  const eliminarActividad = async (actividadId: number) => {
    try {
      setEliminando(actividadId)
      setError(null)

      const { error } = await supabase.from("actividades_expediente").delete().eq("id", actividadId)

      if (error) throw error

      // Actualizar estado local
      setActividades((prevActividades) => prevActividades.filter((act) => act.id !== actividadId))
    } catch (error: any) {
      console.error("Error al eliminar actividad:", error)
      setError("Error al eliminar la actividad. Por favor, intente nuevamente.")
    } finally {
      setEliminando(null)
    }
  }

  // Calcular actividades a mostrar
  const actividadesMostradas = mostrarTodas ? actividades : actividades.slice(0, 3)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Actividades</CardTitle>
            <CardDescription>Historial de actividades del expediente</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            disabled={enviando}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Nueva actividad
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && <div className="bg-destructive/10 text-destructive text-sm p-2 rounded-md mb-4">{error}</div>}

        {mostrarFormulario && (
          <div className="space-y-4 mb-6 p-4 border rounded-md bg-muted/30">
            <div>
              <label htmlFor="descripcion-actividad" className="block text-sm font-medium mb-1">
                Descripción de la actividad
              </label>
              <Input
                id="descripcion-actividad"
                value={nuevaDescripcion}
                onChange={(e) => setNuevaDescripcion(e.target.value)}
                placeholder="Describir la actividad realizada"
                disabled={enviando}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMostrarFormulario(false)
                  setNuevaDescripcion("")
                  setError(null)
                }}
                disabled={enviando}
              >
                Cancelar
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={agregarActividad}
                disabled={enviando || !nuevaDescripcion.trim()}
              >
                {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar actividad"}
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : actividades.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No hay actividades registradas para este expediente.</p>
            <p className="text-sm">Puedes agregar una nueva actividad usando el botón superior.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {actividadesMostradas.map((actividad) => (
              <div key={actividad.id} className={`p-3 border rounded-md ${actividad.automatica ? "bg-muted/30" : ""}`}>
                {editando === actividad.id ? (
                  <div className="space-y-2">
                    <Input
                      value={descripcionEditada}
                      onChange={(e) => setDescripcionEditada(e.target.value)}
                      disabled={enviando}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={cancelarEdicion}
                        disabled={enviando}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => guardarEdicion(actividad.id)}
                        disabled={enviando || !descripcionEditada.trim()}
                        className="h-8 w-8 p-0"
                      >
                        {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{actividad.descripcion}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(actividad.fecha)}</p>
                    </div>
                    <div className="flex gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => iniciarEdicion(actividad)}
                              className="h-8 w-8 p-0"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar actividad</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => eliminarActividad(actividad.id)}
                              disabled={eliminando === actividad.id}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              {eliminando === actividad.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Eliminar actividad</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {actividades.length > 3 && (
          <Button variant="link" className="mt-4 p-0 h-auto" onClick={() => setMostrarTodas(!mostrarTodas)}>
            {mostrarTodas ? "Mostrar menos" : `Ver todas (${actividades.length})`}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
