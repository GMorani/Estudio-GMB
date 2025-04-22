"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { formatDate } from "@/lib/utils"
import { PlusCircle, Loader2, Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react"

type Actividad = {
  id: number
  descripcion: string
  fecha: string
  automatica: boolean
}

type ExpedienteActividadesProps = {
  expedienteId: string
  actividades: Actividad[]
  nuevaActividad?: Actividad | null
}

export function ExpedienteActividades({ expedienteId, actividades, nuevaActividad }: ExpedienteActividadesProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const [actividadesState, setActividadesState] = useState<Actividad[]>(
    actividades.filter((act) => act.descripcion !== "Expediente actualizado"),
  )
  const [mostrarTodas, setMostrarTodas] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [nuevaActividadTexto, setNuevaActividadTexto] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editandoActividad, setEditandoActividad] = useState<number | null>(null)
  const [textoEditado, setTextoEditado] = useState("")
  const [isLoading, setIsLoading] = useState<Record<number, boolean>>({})

  // Determinar cuántas actividades mostrar
  const actividadesMostradas = mostrarTodas ? actividadesState : actividadesState.slice(0, 3)

  // Efecto para manejar la nueva actividad recibida como prop
  useEffect(() => {
    if (nuevaActividad && !actividadesState.some((act) => act.id === nuevaActividad.id)) {
      setActividadesState((prev) => [nuevaActividad, ...prev])
    }
  }, [nuevaActividad])

  // Función para crear una nueva actividad
  const crearActividad = async () => {
    if (!nuevaActividadTexto.trim()) {
      toast({
        title: "Error",
        description: "La descripción de la actividad es obligatoria.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const { data, error } = await supabase
        .from("actividades_expediente")
        .insert({
          expediente_id: expedienteId,
          descripcion: nuevaActividadTexto,
          fecha: new Date().toISOString(),
          automatica: false,
        })
        .select()
        .single()

      if (error) throw error

      // Actualizar el estado local
      setActividadesState((prevActividades) => [data, ...prevActividades])

      // Limpiar el formulario
      setNuevaActividadTexto("")
      setIsCreating(false)

      toast({
        title: "Actividad registrada",
        description: "La actividad ha sido registrada correctamente.",
      })
    } catch (error) {
      console.error("Error al crear actividad:", error)
      toast({
        title: "Error",
        description: "No se pudo registrar la actividad. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para editar una actividad
  const editarActividad = async (id: number) => {
    if (!textoEditado.trim()) {
      toast({
        title: "Error",
        description: "La descripción de la actividad es obligatoria.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading((prev) => ({ ...prev, [id]: true }))

      const { error } = await supabase.from("actividades_expediente").update({ descripcion: textoEditado }).eq("id", id)

      if (error) throw error

      // Actualizar el estado local
      setActividadesState((prevActividades) =>
        prevActividades.map((act) => (act.id === id ? { ...act, descripcion: textoEditado } : act)),
      )

      setEditandoActividad(null)
      setTextoEditado("")

      toast({
        title: "Actividad actualizada",
        description: "La actividad ha sido actualizada correctamente.",
      })
    } catch (error) {
      console.error("Error al editar actividad:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la actividad. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading((prev) => ({ ...prev, [id]: false }))
    }
  }

  // Función para eliminar una actividad
  const eliminarActividad = async (id: number) => {
    try {
      setIsLoading((prev) => ({ ...prev, [id]: true }))

      const { error } = await supabase.from("actividades_expediente").delete().eq("id", id)

      if (error) throw error

      // Actualizar el estado local
      setActividadesState((prevActividades) => prevActividades.filter((act) => act.id !== id))

      toast({
        title: "Actividad eliminada",
        description: "La actividad ha sido eliminada correctamente.",
      })
    } catch (error) {
      console.error("Error al eliminar actividad:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la actividad. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading((prev) => ({ ...prev, [id]: false }))
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Actividades</CardTitle>
        {!isCreating && (
          <Button variant="outline" size="sm" onClick={() => setIsCreating(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Nueva Actividad
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isCreating && (
          <div className="border rounded-md p-4 space-y-4">
            <h3 className="font-medium">Nueva Actividad</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción</label>
              <Input
                value={nuevaActividadTexto}
                onChange={(e) => setNuevaActividadTexto(e.target.value)}
                placeholder="Describir la actividad..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancelar
              </Button>
              <Button onClick={crearActividad} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Actividad"
                )}
              </Button>
            </div>
          </div>
        )}

        {actividadesState.length === 0 && !isCreating ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No hay actividades registradas para este expediente.</p>
            <Button variant="link" onClick={() => setIsCreating(true)}>
              Registrar una nueva actividad
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {actividadesMostradas.map((actividad) => (
              <div key={actividad.id} className={`p-3 border rounded-md ${actividad.automatica ? "bg-muted/30" : ""}`}>
                {editandoActividad === actividad.id ? (
                  <div className="space-y-2">
                    <Input
                      value={textoEditado}
                      onChange={(e) => setTextoEditado(e.target.value)}
                      placeholder="Descripción de la actividad"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditandoActividad(null)
                          setTextoEditado("")
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => editarActividad(actividad.id)}
                        disabled={isLoading[actividad.id]}
                      >
                        {isLoading[actividad.id] ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          "Guardar"
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="font-medium">{actividad.descripcion}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(actividad.fecha)}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setEditandoActividad(actividad.id)
                            setTextoEditado(actividad.descripcion)
                          }}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => eliminarActividad(actividad.id)}
                          disabled={isLoading[actividad.id]}
                          title="Eliminar"
                        >
                          {isLoading[actividad.id] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {actividadesState.length > 3 && (
          <Button variant="ghost" className="w-full text-sm" onClick={() => setMostrarTodas(!mostrarTodas)}>
            {mostrarTodas ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Mostrar menos
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Ver todas ({actividadesState.length})
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
