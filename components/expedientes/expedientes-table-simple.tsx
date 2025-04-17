"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, Pencil } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate, formatCurrency } from "@/lib/utils"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Definir tipos
type Expediente = {
  id: string
  numero: string
  fecha_inicio: string | null
  monto_total: number | null
  persona_nombre: string
  estados: Array<{
    nombre: string
    color: string
  }>
}

export function ExpedientesTableSimple() {
  const [expedientes, setExpedientes] = useState<Expediente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  // Usar useRef para evitar múltiples consultas
  const isLoadingRef = useRef(false)
  const paramsString = useRef("")

  // Memoizar la función de carga para evitar recreaciones
  const fetchExpedientes = useCallback(async () => {
    // Evitar múltiples consultas simultáneas
    if (isLoadingRef.current) return

    // Verificar si los parámetros han cambiado
    const currentParams = searchParams.toString()
    if (currentParams === paramsString.current && expedientes.length > 0) return

    paramsString.current = currentParams
    isLoadingRef.current = true

    try {
      setLoading(true)
      setError(null)

      // Construir la consulta base
      let query = supabase
        .from("expedientes")
        .select(`
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
        .order("fecha_inicio", { ascending: false })

      // Aplicar filtros desde URL
      const numero = searchParams.get("numero")
      const personaId = searchParams.get("persona_id")
      const estadoId = searchParams.get("estado_id")

      if (numero) {
        query = query.ilike("numero", `%${numero}%`)
      }

      if (personaId && personaId !== "all") {
        query = query.eq("expediente_personas.persona_id", personaId)
      }

      if (estadoId && estadoId !== "all") {
        query = query.eq("expediente_estados.estado_id", estadoId)
      }

      // Limitar resultados para evitar sobrecarga
      query = query.limit(50)

      const { data, error: supabaseError } = await query

      if (supabaseError) {
        console.error("Error Supabase:", supabaseError)
        throw new Error(supabaseError.message)
      }

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
    } catch (err: any) {
      console.error("Error al cargar expedientes:", err)
      setError("Error al cargar expedientes. Por favor, intenta nuevamente.")
    } finally {
      setLoading(false)
      isLoadingRef.current = false
    }
  }, [searchParams, supabase])

  // Cargar expedientes solo cuando cambian los parámetros
  useEffect(() => {
    fetchExpedientes()
  }, [fetchExpedientes])

  if (loading && expedientes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Listado de Expedientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-3">Cargando expedientes...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Listado de Expedientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => fetchExpedientes()}>Reintentar</Button>
          </div>
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
                    <TableCell className="font-medium">
                      <Link href={`/expedientes/${expediente.id}`} className="hover:underline">
                        {expediente.numero}
                      </Link>
                    </TableCell>
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
