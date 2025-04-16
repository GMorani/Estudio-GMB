import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ClienteExpedientes } from "@/components/clientes/cliente-expedientes"
import { formatDNI, formatTelefono } from "@/lib/utils"
import { ArrowLeft, Pencil } from "lucide-react"

export default async function ClienteDetallePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerComponentClient({ cookies })

  // Obtener datos del cliente
  const { data: cliente, error } = await supabase
    .from("personas")
    .select(`
      id,
      nombre,
      dni_cuit,
      telefono,
      email,
      domicilio,
      clientes (
        referido
      ),
      vehiculos (
        id,
        marca,
        modelo,
        anio,
        dominio
      )
    `)
    .eq("id", params.id)
    .single()

  if (error || !cliente) {
    notFound()
  }

  // Obtener nombre del referido si existe
  let referidoNombre = ""
  if (cliente.clientes?.referido) {
    const { data: referido } = await supabase
      .from("personas")
      .select("nombre")
      .eq("id", cliente.clientes.referido)
      .single()

    if (referido) {
      referidoNombre = referido.nombre
    }
  }

  // Obtener expedientes relacionados
  const { data: expedientesRelacion } = await supabase
    .from("expediente_personas")
    .select(`
      rol,
      expedientes (
        id,
        numero,
        numero_judicial,
        fecha_inicio,
        fecha_inicio_judicial,
        expediente_estados (
          estados_expediente (
            nombre,
            color
          )
        )
      )
    `)
    .eq("persona_id", params.id)

  const expedientes =
    expedientesRelacion?.map((rel) => ({
      ...rel.expedientes,
      rol: rel.rol,
    })) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/clientes">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Volver</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{cliente.nombre}</h1>
        </div>
        <Button asChild>
          <Link href={`/clientes/${params.id}/editar`}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">DNI</p>
                <p>{formatDNI(cliente.dni_cuit)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Teléfono</p>
                <p>{formatTelefono(cliente.telefono)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Email</p>
                <p>{cliente.email}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Domicilio</p>
                <p>{cliente.domicilio}</p>
              </div>
              {referidoNombre && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Referido por</p>
                  <p>{referidoNombre}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {cliente.vehiculos && cliente.vehiculos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Vehículo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Marca</p>
                  <p>{cliente.vehiculos[0].marca}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Modelo</p>
                  <p>{cliente.vehiculos[0].modelo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Año</p>
                  <p>{cliente.vehiculos[0].anio}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dominio</p>
                  <p>{cliente.vehiculos[0].dominio}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expedientes Vinculados</CardTitle>
        </CardHeader>
        <CardContent>
          <ClienteExpedientes expedientes={expedientes} />
        </CardContent>
      </Card>
    </div>
  )
}
