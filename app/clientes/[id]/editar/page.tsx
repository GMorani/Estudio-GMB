"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft } from "lucide-react"
import { ClienteForm } from "@/components/clientes/cliente-form"

export default function EditarClientePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [cliente, setCliente] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCliente() {
      setLoading(true)
      setError(null)

      try {
        // Primero obtenemos la persona
        const { data: persona, error: personaError } = await supabase
          .from("personas")
          .select(`
            id,
            nombre,
            dni_cuit,
            email,
            telefono,
            direccion,
            tipo_id
          `)
          .eq("id", params.id)
          .single()

        if (personaError) throw personaError

        // Luego obtenemos los datos específicos del cliente
        const { data: clienteData, error: clienteError } = await supabase
          .from("clientes")
          .select(`
            id,
            persona_id,
            fecha_alta,
            notas
          `)
          .eq("persona_id", params.id)
          .maybeSingle()

        if (clienteError) throw clienteError

        // Combinamos los datos
        setCliente({
          ...persona,
          ...clienteData,
        })
      } catch (err: any) {
        console.error("Error al cargar cliente:", err)
        setError(err.message || "Error al cargar el cliente")
      } finally {
        setLoading(false)
      }
    }

    fetchCliente()
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
        <h2 className="text-xl font-semibold mb-2">Error al cargar el cliente</h2>
        <p>{error}</p>
        <Button className="mt-4" onClick={() => router.push("/clientes")}>
          Volver a clientes
        </Button>
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className="rounded-md border p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Cliente no encontrado</h2>
        <p className="text-muted-foreground mb-4">El cliente solicitado no existe o ha sido eliminado.</p>
        <Button onClick={() => router.push("/clientes")}>Volver a clientes</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Editar Cliente</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formulario de edición</CardTitle>
          <CardDescription>Actualiza la información del cliente {cliente.nombre}</CardDescription>
        </CardHeader>
        <CardContent>
          <ClienteForm
            clienteId={params.id}
            initialData={cliente}
            onSuccess={() => router.push(`/clientes/${params.id}`)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
