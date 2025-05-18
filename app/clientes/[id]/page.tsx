import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ClienteExpedientes } from "@/components/clientes/cliente-expedientes"
import { formatDNI, formatTelefono } from "@/lib/utils"
import { ArrowLeft, Pencil } from "lucide-react"

// Marcar la página como dinámica para asegurar que se renderice en cada solicitud
export const dynamic = "force-dynamic"
export const revalidate = 0

// Función para validar UUID
function isValidUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

export default async function ClienteDetallePage({
  params,
}: {
  params: { id: string }
}) {
  // Verificar si el ID es "nuevo" y redirigir
  if (params.id === "nuevo") {
    redirect("/clientes/nuevo")
    return null // Este return nunca se ejecutará debido a la redirección, pero ayuda a TypeScript
  }

  // Verificar que el ID sea un UUID válido
  if (!params.id || !isValidUUID(params.id)) {
    console.error("ID de cliente inválido o no es un UUID:", params.id)
    notFound()
    return null // Este return nunca se ejecutará debido a notFound(), pero ayuda a TypeScript
  }

  const supabase = createServerComponentClient({ cookies })

  try {
    console.log("Buscando cliente con ID:", params.id)

    // Primero verificamos si el cliente existe
    const { data: clienteExiste, error: errorExiste } = await supabase
      .from("personas")
      .select("id")
      .eq("id", params.id)
      .single()

    if (errorExiste || !clienteExiste) {
      console.error("Cliente no encontrado:", errorExiste)
      notFound()
      return null // Este return nunca se ejecutará debido a notFound(), pero ayuda a TypeScript
    }

    // Si llegamos aquí, el cliente existe, ahora obtenemos todos sus datos
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
        )
      `)
      .eq("id", params.id)
      .single()

    if (error || !cliente) {
      console.error("Error al obtener datos del cliente:", error)
      return (
        <div className="p-4">
          <h1 className="text-xl font-bold">Error al cargar los datos del cliente</h1>
          <p className="text-red-500">Detalles: {error?.message || "Error desconocido"}</p>
          <Button asChild className="mt-4">
            <Link href="/clientes">Volver a la lista de clientes</Link>
          </Button>
        </div>
      )
    }

    // Obtener vehículos por separado para evitar problemas con las relaciones anidadas
    const { data: vehiculos } = await supabase.from("vehiculos").select("*").eq("persona_id", params.id)

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

          {vehiculos && vehiculos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Vehículo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Marca</p>
                    <p>{vehiculos[0].marca}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Modelo</p>
                    <p>{vehiculos[0].modelo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Año</p>
                    <p>{vehiculos[0].anio}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dominio</p>
                    <p>{vehiculos[0].dominio}</p>
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
  } catch (error: any) {
    console.error("Error crítico en ClienteDetallePage:", error)

    // Mostrar una página de error con detalles en lugar de notFound()
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold">Error al cargar la página</h1>
        <p className="text-red-500">Detalles: {error?.message || "Error desconocido"}</p>
        <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto text-xs">{JSON.stringify(error, null, 2)}</pre>
        <Button asChild className="mt-4">
          <Link href="/clientes">Volver a la lista de clientes</Link>
        </Button>
      </div>
    )
  }
}
