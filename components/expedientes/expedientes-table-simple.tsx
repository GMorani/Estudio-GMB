"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/utils"
import { ExpedientesFilter } from "@/components/expedientes/expedientes-filter"

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

export function ExpedientesTableSimple({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const [expedientes, setExpedientes] = useState<Expediente[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Obtener parámetros de búsqueda
  const numero = searchParams?.numero as string
  const personaId = searchParams?.persona as string
  const estadoId = searchParams?.estado as string
  const tipo = searchParams?.tipo as string
  const ordenarPor = searchParams?.ordenarPor as string
  const ordenAscendente = searchParams?.ordenAscendente === "true"

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

        // Aplicar filtros
        if (numero) {
          query = query.ilike("numero", `%${numero}%`)
        }

        if (personaId && personaId !== "all") {
          query = query.filter("expediente_personas.persona_id", "eq", personaId)
        }

        if (estadoId && estadoId !== "all") {
          query = query.filter("expediente_estados.estado_id", "eq", estadoId)
        }

        // Filtrar por tipo (activos, archivados, todos)
        if (tipo === "activos") {
          // Asumiendo que hay un estado "Archivado" con ID 5 (ajustar según tu base de datos)
          query = query.not("expediente_estados.estado_id", "eq", 5)
        } else if (tipo === "archivados") {
          query = query.filter("expediente_estados.estado_id", "eq", 5)
        }

        // Ordenar
        const sortBy = ordenarPor || "fecha_inicio"
        const ascending = ordenAscendente !== undefined ? ordenAscendente : false
        query = query.order(sortBy, { ascending })

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
  }, [supabase, numero, personaId, estadoId, tipo, ordenarPor, ordenAscendente])

  // Construir la URL con los parámetros de búsqueda
  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set(name, value)
    return params.toString()
  }

  return (
    <div className="space-y-4">
      <ExpedientesFilter />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Fecha Inicio</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Monto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Renderizar esqueletos si está cargando
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton />
                  </TableCell>
                  <TableCell>
                    <Skeleton />
                  </TableCell>
                  <TableCell>
                    <Skeleton />
                  </TableCell>
                  <TableCell>
                    <Skeleton />
                  </TableCell>
                  <TableCell>
                    <Skeleton />
                  </TableCell>
                </TableRow>
              ))
            ) : expedientes.length === 0 ? (
              // Mensaje si no hay expedientes
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No se encontraron expedientes
                </TableCell>
              </TableRow>
            ) : (
              // Renderizar expedientes
              expedientes.map((expediente) => (
                <TableRow key={expediente.id}>
                  <TableCell className="font-medium">
                    <Link href={`/expedientes/${expediente.id}`} className="hover:underline">
                      {expediente.numero}
                    </Link>
                  </TableCell>
                  <TableCell>{formatDate(expediente.fecha_inicio)}</TableCell>
                  <TableCell>{expediente.persona_nombre}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {expediente.estados?.slice(0, 2).map((estado, index) => (
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
                      {expediente.estados?.length > 2 && (
                        <Badge variant="outline">+ {expediente.estados.length - 2}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{expediente.monto_total}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
