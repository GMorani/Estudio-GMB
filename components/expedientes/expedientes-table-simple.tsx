"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Eye, Pencil } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate, formatCurrency } from "@/lib/utils"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function ExpedientesTableSimple() {
  const [expedientes, setExpedientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchExpedientes() {
      try {
        const { data } = await supabase
          .from("expedientes")
          .select(`
            id,
            numero,
            fecha_inicio,
            monto_total,
            expediente_personas (
              personas (
                id,
                nombre
              )
            ),
            expediente_estados (
              estados_expediente (
                id,
                nombre,
                color
              )
            )
          `)
          .order("fecha_inicio", { ascending: false })
          .limit(50)

        if (data) {
          const formattedData = data.map((exp) => {
            const personaNombre = exp.expediente_personas?.[0]?.personas?.nombre || "Sin persona"

            return {
              id: exp.id,
              numero: exp.numero,
              fecha_inicio: exp.fecha_inicio,
              monto_total: exp.monto_total,
              persona_nombre: personaNombre,
              estados: exp.expediente_estados.map((estado: any) => ({
                nombre: estado.estados_expediente.nombre,
                color: estado.estados_expediente.color,
              })),
            }
          })

          setExpedientes(formattedData)
        }
      } catch (error) {
        console.error("Error al cargar expedientes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchExpedientes()
  }, [supabase])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Listado de Expedientes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4">Cargando expedientes...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Listado de Expedientes</CardTitle>
      </CardHeader>
      <CardContent>
        {expedientes.length === 0 ? (
          <p className="text-center py-4">No se encontraron expedientes</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Persona</TableHead>
                  <TableHead>Fecha Inicio</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estados</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expedientes.map((expediente) => (
                  <TableRow key={expediente.id}>
                    <TableCell className="font-medium">{expediente.numero}</TableCell>
                    <TableCell>{expediente.persona_nombre}</TableCell>
                    <TableCell>{formatDate(expediente.fecha_inicio || "")}</TableCell>
                    <TableCell>
                      {expediente.monto_total ? formatCurrency(expediente.monto_total) : "No especificado"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {expediente.estados.slice(0, 2).map((estado: any, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            style={{
                              backgroundColor: estado.color ? `${estado.color}20` : undefined,
                              color: estado.color,
                              borderColor: estado.color,
                            }}
                          >
                            {estado.nombre}
                          </Badge>
                        ))}
                        {expediente.estados.length > 2 && (
                          <Badge variant="outline">+{expediente.estados.length - 2}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/expedientes/${expediente.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/expedientes/${expediente.id}/editar`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </Link>
                        </Button>
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
  )
}
