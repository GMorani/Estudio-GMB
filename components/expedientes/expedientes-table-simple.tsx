"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Eye, Pencil, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { formatDate, formatCurrency } from "@/lib/utils"
import { ExpedientesFilter } from "@/components/expedientes/expedientes-filter"
import { useToast } from "@/components/ui/use-toast"

type Expediente = {
  id: string
  numero: string
  fecha_inicio: string | null
  monto_total: number | null
  autos: string | null
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
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

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
      setError(null)

      try {
        console.log("Cargando expedientes con filtros:", {
          numero,
          personaId,
          estadoId,
          tipo,
          ordenarPor,
          ordenAscendente,
        })

        // Construir la consulta base
        let query = supabase.from("expedientes").select(`
          id,
          numero,
          fecha_inicio,
          monto_total,
          autos,
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

        // Limitar resultados para evitar problemas de rendimiento
        query = query.limit(100)

        const { data, error: queryError } = await query

        if (queryError) throw queryError

        console.log("Expedientes cargados:", data?.length || 0)

        // Transformar los datos para facilitar su uso
        const formattedData =
          data?.map((exp) => {
            return {
              id: exp.id,
              numero: exp.numero,
              fecha_inicio: exp.fecha_inicio,
              monto_total: exp.monto_total,
              autos: exp.autos || "Sin descripción",
              estados: exp.expediente_estados.map((estado: any) => ({
                nombre: estado.estados_expediente.nombre,
                color: estado.estados_expediente.color,
              })),
            }
          }) || []

        setExpedientes(formattedData)
      } catch (err: any) {
        console.error("Error al cargar expedientes:", err)
        setError(err.message || "Error al cargar expedientes")

        toast({
          title: "Error",
          description: "No se pudieron cargar los expedientes. Por favor, intenta nuevamente.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchExpedientes()
  }, [supabase, numero, personaId, estadoId, tipo, ordenarPor, ordenAscendente, toast])

  // Función para eliminar un expediente
  const eliminarExpediente = async (id: string) => {
    try {
      // 1. Eliminar relaciones en expediente_personas
      const { error: errorPersonas } = await supabase.from("expediente_personas").delete().eq("expediente_id", id)
      if (errorPersonas) throw errorPersonas

      // 2. Eliminar relaciones en expediente_estados
      const { error: errorEstados } = await supabase.from("expediente_estados").delete().eq("expediente_id", id)
      if (errorEstados) throw errorEstados

      // 3. Eliminar actividades relacionadas
      const { error: errorActividades } = await supabase.from("actividades_expediente").delete().eq("expediente_id", id)
      if (errorActividades) throw errorActividades

      // 4. Eliminar tareas relacionadas
      const { error: errorTareas } = await supabase.from("tareas_expediente").delete().eq("expediente_id", id)
      if (errorTareas) throw errorTareas

      // 5. Finalmente, eliminar el expediente
      const { error: errorExpediente } = await supabase.from("expedientes").delete().eq("id", id)
      if (errorExpediente) throw errorExpediente

      // Actualizar la lista de expedientes
      setExpedientes(expedientes.filter((exp) => exp.id !== id))

      toast({
        title: "Expediente eliminado",
        description: "El expediente ha sido eliminado correctamente",
      })
    } catch (error: any) {
      console.error("Error al eliminar expediente:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el expediente. Por favor, intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <ExpedientesFilter />

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          <p>{error}</p>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Fecha Inicio</TableHead>
              <TableHead>Autos</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Renderizar esqueletos si está cargando
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : expedientes.length === 0 ? (
              // Mensaje si no hay expedientes
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No se encontraron expedientes
                </TableCell>
              </TableRow>
            ) : (
              // Renderizar expedientes
              expedientes.map((expediente) => (
                <TableRow key={expediente.id}>
                  <TableCell className="font-medium">{expediente.numero}</TableCell>
                  <TableCell>{formatDate(expediente.fecha_inicio)}</TableCell>
                  <TableCell>{expediente.autos}</TableCell>
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
                      {(expediente.estados?.length || 0) > 2 && (
                        <Badge variant="outline">+ {expediente.estados.length - 2}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(expediente.monto_total)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/expedientes/${expediente.id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Ver</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/expedientes/${expediente.id}/editar`}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará permanentemente el expediente y todas sus
                              relaciones.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => eliminarExpediente(expediente.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
