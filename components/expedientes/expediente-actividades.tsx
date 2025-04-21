"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { formatDate } from "@/lib/utils"
import { PlusCircle, Loader2, ChevronDown, ChevronUp } from "lucide-react"

type Actividad = {
  id: number
  descripcion: string
  fecha: string
  automatica: boolean
}

type ExpedienteActividadesProps = {
  expedienteId: string
  actividades: Actividad[]
}

export function ExpedienteActividades({ expedienteId, actividades }: ExpedienteActividadesProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const [actividadesState, setActividadesState] = useState<Actividad[]>(actividades)
  const [isCreating, setIsCreating] = useState(false)
  const [nuevaActividad, setNuevaActividad] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mostrarTodas, setMostrarTodas] = useState(false)

  // Función para crear una nueva actividad
  const crearActividad = async () => {
    if (!nuevaActividad.trim()) {
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
          descripcion: nuevaActividad,
          fecha: new Date().toISOString(),
          automatica: false,
        })
        .select()
        .single()

      if (error) throw error

      // Actualizar el estado local
      setActividadesState((prevActividades) => [data, ...prevActividades])

      // Limpiar el formulario
      setNuevaActividad("")
      setIsCreating(false)

      toast({
        title: "Actividad registrada",
        description: "La actividad ha sido registrada correctamente.",
      })
    } catch (error) {
      console.error("Error al registrar actividad:", error)
      toast({
        title: "Error",
        description: "No se pudo registrar la actividad. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      router.refresh()
    }
  }

  // Determinar cuántas actividades mostrar
  const actividadesMostradas = mostrarTodas ? actividadesState : actividadesState.slice(0, 3)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Actividad</CardTitle>
        {!isCreating && (
          <Button variant="outline" size="sm" onClick={() => setIsCreating(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Registrar Actividad
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
                value={nuevaActividad}
                onChange={(e) => setNuevaActividad(e.target.value)}
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

        {actividadesState.length === 0 ? (
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
                <p className="font-medium">{actividad.descripcion}</p>
                <p className="text-sm text-muted-foreground">{formatDate(actividad.fecha)}</p>
              </div>
            ))}

            {actividadesState.length > 3 && (
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={() => setMostrarTodas(!mostrarTodas)}
              >
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
          </div>
        )}
      </CardContent>
    </Card>
  )
}
