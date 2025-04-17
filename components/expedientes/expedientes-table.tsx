"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Eye, Pencil, ArrowUpDown, RefreshCcw } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate, formatCurrency } from "@/lib/utils"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"

export function ExpedientesTable() {
  const [expedientes, setExpedientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ordenarPor, setOrdenarPor] = useState<string>("fecha_inicio")
  const [ordenAscendente, setOrdenAscendente] = useState<boolean>(false)
  const { toast } = useToast()

  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  // Cargar expedientes
  useEffect(() => {
    let isMounted = true

    async function cargarExpedientes() {
      if (!isMounted) return

      setLoading(true)
      setError(null)

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

        // Aplicar filtros de búsqueda
        const numero = searchParams.get("numero")
        const personaId = searchParams.get("persona_id")
        const estadoId = searchParams.get("estado_id")

        if (numero) {
          query = query.ilike("numero", `%${numero}%`)
        }

        if (personaId && personaId !== "all") {
          query = query.filter("expediente_personas.persona_id", "eq", personaId)
        }

        if (estadoId && estadoId !== "all") {
          query = query.filter("expediente_estados.estado_id", "eq", estadoId)
        }

        // Ordenar
        query = query.order(ordenarPor, { ascending: ordenAscendente })

        // Limitar resultados para evitar sobrecarga
        query = query.limit(100)

        const { data, error } = await query

        if (error) throw error

        // Solo actualizar el estado si el componente sigue montado
        if (isMounted) {
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
          setLoading(false)
        }
      } catch (error: any) {
        console.error("Error al cargar expedientes:", error)

        // Solo actualizar el estado si el componente sigue montado
        if (isMounted) {
          setError("Error al cargar los expedientes. Por favor, intenta nuevamente.")
          setLoading(false)

          toast({
            title: "Error",
            description: "Ocurrió un error al cargar los expedientes.",
            variant: "destructive",
          })
        }
      }
    }

    cargarExpedientes()

    // Cleanup function
    return () => {
      isMounted = false
    }
  }, [searchParams, ordenarPor, ordenAscendente, supabase, toast])

  // Manejar ordenamiento
  function handleSort(columna: string) {
    if (ordenarPor === columna) {
      setOrdenAscendente(!ordenAscendente)
    } else {
      setOrdenarPor(columna)
      setOrdenAscendente(true)
    }
  }

  // Renderizar estado de carga
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Listado de Expedientes</CardTitle>
          <CardDescription>Todos los expedientes en el sistema</CardDescription>
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

  // Renderizar estado de error
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Ocurrió un problema al cargar los expedientes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border p-4 bg-red-50 text-red-800">
            <p>{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setLoading(true)
                setError(null)
              }}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Intentar nuevamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Renderizar tabla de expedientes
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Listado de Expedientes</CardTitle>
          <CardDescription>Todos los expedientes en el sistema</CardDescription>
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
