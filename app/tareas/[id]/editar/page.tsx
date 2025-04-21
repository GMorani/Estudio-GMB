"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft } from "lucide-react"
import { TareaForm } from "@/components/tareas/tarea-form"

export default function EditarTareaPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [tarea, setTarea] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
            expediente_id
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
          <CardContent>
            <Skeleton className="h-[400px] w-full" />
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
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
          <TareaForm tareaId={params.id} initialData={tarea} onSuccess={() => router.push(`/tareas/${params.id}`)} />
        </CardContent>
      </Card>
    </div>
  )
}
