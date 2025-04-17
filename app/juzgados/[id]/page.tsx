import Link from "next/link"
import { notFound } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Edit } from "lucide-react"

// Marcar la página como dinámica
export const dynamic = "force-dynamic"

export default async function JuzgadoDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })

  // Obtener datos del juzgado
  const { data: juzgado, error } = await supabase
    .from("personas")
    .select(`
      id,
      nombre,
      domicilio,
      telefono,
      email,
      juzgados (
        nombre_juez,
        nombre_secretario
      )
    `)
    .eq("id", params.id)
    .eq("tipo_id", 4) // Tipo juzgado
    .single()

  if (error || !juzgado) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="icon">
            <Link href="/juzgados">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Volver</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{juzgado.nombre}</h1>
        </div>
        <Button asChild>
          <Link href={`/juzgados/${juzgado.id}/editar`}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información del Juzgado</CardTitle>
            <CardDescription>Datos generales del juzgado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-sm">Nombre</h3>
              <p>{juzgado.nombre}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm">Juez</h3>
              <p>{juzgado.juzgados?.nombre_juez || "No especificado"}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm">Secretario</h3>
              <p>{juzgado.juzgados?.nombre_secretario || "No especificado"}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm">Dirección</h3>
              <p>{juzgado.domicilio}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contacto</CardTitle>
            <CardDescription>Información de contacto del juzgado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-sm">Teléfono</h3>
              <p>{juzgado.telefono}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm">Correo electrónico</h3>
              <p>{juzgado.email}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
