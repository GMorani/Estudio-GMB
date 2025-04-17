import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDNI, formatTelefono, formatDate } from "@/lib/utils"
import { ArrowLeft, Pencil } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Marcar la página como dinámica
export const dynamic = "force-dynamic"

export default async function AseguradoraDetallePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerComponentClient({ cookies })

  // Obtener datos de la aseguradora
  const { data: aseguradora, error } = await supabase
    .from("personas")
    .select(`
      id,
      nombre,
      dni_cuit,
      telefono,
      email,
      domicilio,
      aseguradoras (
        id
      )
    `)
    .eq("id", params.id)
    .single()

  if (error || !aseguradora) {
    notFound()
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
            <Link href="/aseguradoras">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Volver</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{aseguradora.nombre}</h1>
        </div>
        <Button asChild>
          <Link href={`/aseguradoras/${params.id}/editar`}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">CUIT</p>
                <p>{formatDNI(aseguradora.dni_cuit)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Teléfono</p>
                <p>{formatTelefono(aseguradora.telefono)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Email</p>
                <p>{aseguradora.email}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Domicilio</p>
                <p>{aseguradora.domicilio}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expedientes Vinculados</CardTitle>
        </CardHeader>
        <CardContent>
          {expedientes.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No hay expedientes vinculados</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Expediente Judicial</TableHead>
                    <TableHead>Fecha Inicio</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expedientes.map((expediente) => (
                    <TableRow key={expediente.id}>
                      <TableCell>
                        <Link href={`/expedientes/${expediente.id}`} className="font-medium hover:underline">
                          {expediente.numero}
                        </Link>
                      </TableCell>
                      <TableCell>{expediente.numero_judicial || "-"}</TableCell>
                      <TableCell>{formatDate(expediente.fecha_inicio || "")}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{expediente.rol}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {expediente.expediente_estados?.slice(0, 2).map((estado, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              style={{
                                backgroundColor: estado.estados_expediente.color
                                  ? `${estado.estados_expediente.color}20`
                                  : undefined,
                                color: estado.estados_expediente.color,
                                borderColor: estado.estados_expediente.color,
                              }}
                            >
                              {estado.estados_expediente.nombre}
                            </Badge>
                          ))}
                          {(expediente.expediente_estados?.length || 0) > 2 && (
                            <Badge variant="outline">+{(expediente.expediente_estados?.length || 0) - 2}</Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
