"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/utils"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

type Tarea = {
  id: string
  descripcion: string
  fecha_vencimiento: string
  expediente_id: string
  expediente_numero: string
  prioridad: string
}

export function ProximasTareas() {
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchTareas() {
      try {
        const { data, error } = await supabase
          .from("tareas_expediente")
          .select(`
            id,
            descripcion,
            fecha_vencimiento,
            prioridad,
            expediente_id,
            expedientes (
              numero
            )
          `)
          .eq("cumplida", false)
          .order("fecha_vencimiento", { ascending: true })
          .limit(5)

        if (error) throw error

        // Transformar los datos para facilitar su uso
        const formattedData = data.map((tarea) => ({
          id: tarea.id,
          descripcion: tarea.descripcion,
          fecha_vencimiento: tarea.fecha_vencimiento,
          prioridad: tarea.prioridad || "normal",
          expediente_id: tarea.expediente_id,
          expediente_numero: tarea.expedientes?.numero || "Sin expediente",
        }))

        setTareas(formattedData)
      } catch (error) {
        console.error("Error al cargar tareas pendientes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTareas()
  }, [supabase])

  async function marcarComoCompletada(id: string) {
    try {
      const { error } = await supabase
        .from("tareas_expediente")
        .update({
          cumplida: true,
          fecha_cumplimiento: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error

      // Actualizar la lista de tareas
      setTareas(tareas.filter((tarea) => tarea.id !== id))

      // Registrar la actividad
      await supabase.from("actividades_expediente").insert({
        expediente_id: tareas.find((t) => t.id === id)?.expediente_id,
        descripcion: `Tarea cumplida: ${tareas.find((t) => t.id === id)?.descripcion}`,
        fecha: new Date().toISOString(),
        automatica: true,
      })

      toast({
        title: "Tarea completada",
        description: "La tarea ha sido marcada como completada",
      })
    } catch (error) {
      console.error("Error al marcar tarea como completada:", error)
      toast({
        title: "Error",
        description: "No se pudo completar la tarea",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tareas Pendientes</CardTitle>
          <CardDescription>Tareas pendientes con vencimiento próximo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (tareas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tareas Pendientes</CardTitle>
          <CardDescription>Tareas pendientes con vencimiento próximo</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No hay tareas pendientes</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tareas Pendientes</CardTitle>
        <CardDescription>Tareas pendientes con vencimiento próximo</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tareas.map((tarea) => (
            <div key={tarea.id} className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{tarea.descripcion}</span>
                  <Badge
                    variant={
                      tarea.prioridad === "alta" ? "destructive" : tarea.prioridad === "baja" ? "secondary" : "outline"
                    }
                  >
                    {tarea.prioridad}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Link href={`/expedientes/${tarea.expediente_id}`} className="hover:underline">
                    Exp. {tarea.expediente_numero}
                  </Link>
                  <span>•</span>
                  <span>Vence: {formatDate(tarea.fecha_vencimiento)}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => marcarComoCompletada(tarea.id)}
                title="Marcar como completada"
              >
                <CheckCircle className="h-5 w-5" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
