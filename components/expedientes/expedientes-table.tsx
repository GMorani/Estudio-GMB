"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Eye, Pencil, ArrowUpDown } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate, formatCurrency } from "@/lib/utils"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

type Expediente = {
  id: string
  numero: string
  fecha_inicio: string | null
  monto_total: number | null
  persona_nombre: string | null
  estados: {
    nombre: string
    color: string
  }[]
}

export function ExpedientesTable() {
  const [expedientes, setExpedientes] = useState<Expediente[]>([])
  const [loading, setLoading] = useState(true)
  const [ordenarPor, setOrdenarPor] = useState<string>("fecha_inicio")
  const [ordenAscendente, setOrdenAscendente] = useState<boolean>(false)

  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  const filtroNumero = searchParams.get("numero")
  const filtroPersonaId = searchParams.get("persona_id")
  const filtroEstadoId = searchParams.get("estado_id")
  const filtroTipo = searchParams.get("filtro") || "activos"

  useEffect(() => {
    async function fetchExpedientes() {
      setLoading(true)
      try {
        // Construir la consulta base
        let query = supabase.from("expedientes").select(`
            id,
            numero,
            fecha_inicio,
            monto_total,
            expediente_personas!inner (
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

        // Aplicar filtros
        if (filtroNumero) {
          query = query.ilike("numero", `%${filtroNumero}%`)
        }

        if (filtroPersonaId) {
          query = query.filter("expediente_personas.persona_id", "eq", filtroPersonaId)
        }

        if (filtroEstadoId) {
          query = query.filter("expediente_estados.estado_id", "eq", filtroEstadoId)
        }

        // Filtrar por tipo (activos, archivados, todos)
        if (filtroTipo === "activos") {
          // Asumiendo que hay un estado "Archivado" con ID 5 (ajustar según tu base de datos)
          query = query.not("expediente_estados.estado_id", "eq", 5)
        } else if (filtroTipo === "archivados") {
          query = query.filter("expediente_estados.estado_id", "eq", 5)
        }

        // Ordenar
        query = query.order(ordenarPor, { ascending: ordenAscendente })

        const { data, error } = await query

        if (error) throw error

        // Transformar los datos para facilitar su uso
        const formattedData = data.map((exp) => {
          // Obtener el nombre de la primera persona asociada (generalmente el cliente principal)
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
      } catch (error) {
        console.error("Error al cargar expedientes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchExpedientes()
  }, [supabase, filtroNumero, filtroPersonaId, filtroEstadoId, filtroTipo, ordenarPor, ordenAscendente])

  const handleSort = (columna: string) => {
    if (ordenarPor === columna) {
      setOrdenAscendente(!ordenAscendente)
    } else {
      setOrdenarPor(columna)
      setOrdenAscendente(true)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            Listado de Expedientes{" "}
            {filtroTipo === "activos" ? "Activos" : filtroTipo === "archivados" ? "Archivados" : ""}
          </CardTitle>
          <CardDescription>Expedientes en curso en el estudio</CardDescription>
        </CardHeader>
        <CardContent>
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
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-20" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>
            Listado de Expedientes{" "}
            {filtroTipo === "activos" ? "Activos" : filtroTipo === "archivados" ? "Archivados" : ""}
          </CardTitle>
          <CardDescription>Expedientes en curso en el estudio</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => handleSort("numero")}>
          <ArrowUpDown className="mr-2 h-4 w-4" />
          Ordenar
        </Button>
      </CardHeader>
      <CardContent>
        {expedientes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No se encontraron expedientes con los criterios seleccionados
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("numero")}>
                    Número {ordenarPor === "numero" && (ordenAscendente ? "↑" : "↓")}
                  </TableHead>
                  <TableHead>Persona</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("fecha_inicio")}>
                    Fecha Inicio {ordenarPor === "fecha_inicio" && (ordenAscendente ? "↑" : "↓")}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("monto_total")}>
                    Monto {ordenarPor === "monto_total" && (ordenAscendente ? "↑" : "↓")}
                  </TableHead>
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
                        {expediente.estados.slice(0, 2).map((estado, index) => (
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
