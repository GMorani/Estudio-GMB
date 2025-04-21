"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, FileText, Mail, MapPin, Phone, User } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { ClienteExpedientes } from "@/components/clientes/cliente-expedientes"

export default function ClientePage({ params }: { params: { id: string } }) {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{cliente.nombre}</h1>
            <p className="text-muted-foreground">Cliente desde {formatDate(cliente.fecha_alta)}</p>
          </div>
        </div>
        <Button onClick={() => router.push(`/clientes/${params.id}/editar`)}>Editar cliente</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del cliente</CardTitle>
          <CardDescription>Datos personales y de contacto</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">DNI/CUIT</h3>
                  <p className="text-lg">{cliente.dni_cuit || "No especificado"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Teléfono</h3>
                  <p className="text-lg">{cliente.telefono || "No especificado"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                  <p className="text-lg">{cliente.email || "No especificado"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Dirección</h3>
                  <p className="text-lg">{cliente.direccion || "No especificada"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Notas</h3>
                  <p className="text-lg whitespace-pre-wrap">{cliente.notas || "Sin notas adicionales"}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="expedientes">
        <TabsList>
          <TabsTrigger value="expedientes">
            <FileText className="mr-2 h-4 w-4" />
            Expedientes
          </TabsTrigger>
        </TabsList>
        <TabsContent value="expedientes" className="mt-4">
          <ClienteExpedientes clienteId={params.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
