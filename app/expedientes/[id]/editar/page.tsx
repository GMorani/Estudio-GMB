"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft } from "lucide-react"
import { ExpedienteForm } from "@/components/expedientes/expediente-form"

export default function EditarExpedientePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [expediente, setExpediente] = useState<any>(null)
  const [expedientePersonas, setExpedientePersonas] = useState<any[]>([])
  const [expedienteEstados, setExpedienteEstados] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchExpediente() {
      setLoading(true)
      setError(null)

      try {
        // 1. Obtener datos básicos del expediente
        const { data: expedienteData, error: expedienteError } = await supabase
          .from("expedientes")
          .select("*")
          .eq("id", params.id)
          .single()

        if (expedienteError) throw expedienteError

        // 2. Obtener personas relacionadas con el expediente
        const { data: personasData, error: personasError } = await supabase
          .from("expediente_personas")
          .select("id, rol, persona_id")
          .eq("expediente_id", params.id)

        if (personasError) {
          console.error("Error al cargar personas del expediente:", personasError)
          // No lanzamos error para que la carga continúe
        }

        // 3. Obtener estados del expediente
        const { data: estadosData, error: estadosError } = await supabase
          .from("expediente_estados")
          .select("id, estado_id, fecha_asignacion")
          .eq("expediente_id", params.id)

        if (estadosError) {
          console.error("Error al cargar estados del expediente:", estadosError)
          // No lanzamos error para que la carga continúe
        }

        // Establecer los datos
        setExpediente(expedienteData)
        setExpedientePersonas(personasData || [])
        setExpedienteEstados(estadosData || [])
      } catch (err: any) {
        console.error("Error al cargar expediente:", err)
        setError(err.message || "Error al cargar el expediente")
      } finally {
        setLoading(false)
      }
    }

    fetchExpediente()
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
        <h2 className="text-xl font-semibold mb-2">Error al cargar el expediente</h2>
        <p>{error}</p>
        <Button className="mt-4" onClick={() => router.push("/expedientes")}>
          Volver a expedientes
        </Button>
      </div>
    )
  }

  if (!expediente) {
    return (
      <div className="rounded-md border p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Expediente no encontrado</h2>
        <p className="text-muted-foreground mb-4">El expediente solicitado no existe o ha sido eliminado.</p>
        <Button onClick={() => router.push("/expedientes")}>Volver a expedientes</Button>
      </div>
    )
  }

  // Preparar los datos para el formulario
  const initialData = {
    ...expediente,
    expediente_personas: expedientePersonas,
    expediente_estados: expedienteEstados,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Editar Expediente</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formulario de edición</CardTitle>
          <CardDescription>Actualiza la información del expediente {expediente.numero}</CardDescription>
        </CardHeader>
        <CardContent>
          <ExpedienteForm
            expedienteId={params.id}
            initialData={initialData}
            onSuccess={() => router.push(`/expedientes/${params.id}`)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
