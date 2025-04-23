"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
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
import { Edit, Eye, Trash2 } from "lucide-react"
import { JuzgadosFilter, type JuzgadoFilters } from "./juzgados-filter"

type Juzgado = {
  id: string
  nombre: string
  nombre_juez: string | null
  nombre_secretario: string | null
  domicilio: string
  telefono: string
  email: string
}

type JuzgadosTableFilterableProps = {
  juzgados: Juzgado[]
}

export function JuzgadosTableFilterable({ juzgados }: JuzgadosTableFilterableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const [isDeleting, setIsDeleting] = useState(false)
  const [juzgadoToDelete, setJuzgadoToDelete] = useState<string | null>(null)
  const [filters, setFilters] = useState<JuzgadoFilters>({
    search: "",
    juez: "",
    secretario: "",
    direccion: "",
  })

  // Extraer listas únicas para los filtros
  const jueces = useMemo(() => {
    const uniqueJueces = new Set<string>()
    juzgados.forEach((juzgado) => {
      if (juzgado.nombre_juez) uniqueJueces.add(juzgado.nombre_juez)
    })
    return Array.from(uniqueJueces).sort()
  }, [juzgados])

  const secretarios = useMemo(() => {
    const uniqueSecretarios = new Set<string>()
    juzgados.forEach((juzgado) => {
      if (juzgado.nombre_secretario) uniqueSecretarios.add(juzgado.nombre_secretario)
    })
    return Array.from(uniqueSecretarios).sort()
  }, [juzgados])

  const direcciones = useMemo(() => {
    const uniqueDirecciones = new Set<string>()
    juzgados.forEach((juzgado) => {
      if (juzgado.domicilio) {
        // Extraer solo la parte principal de la dirección para el filtro
        const mainAddress = juzgado.domicilio.split(",")[0]
        uniqueDirecciones.add(mainAddress)
      }
    })
    return Array.from(uniqueDirecciones).sort()
  }, [juzgados])

  // Aplicar filtros a los juzgados
  const filteredJuzgados = useMemo(() => {
    return juzgados.filter((juzgado) => {
      // Filtro por búsqueda (nombre o número)
      if (filters.search && !juzgado.nombre.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }

      // Filtro por juez
      if (filters.juez && juzgado.nombre_juez !== filters.juez) {
        return false
      }

      // Filtro por secretario
      if (filters.secretario && juzgado.nombre_secretario !== filters.secretario) {
        return false
      }

      // Filtro por dirección
      if (filters.direccion && !juzgado.domicilio.includes(filters.direccion)) {
        return false
      }

      return true
    })
  }, [juzgados, filters])

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true)

      // Verificar si el juzgado está siendo utilizado en expedientes
      const { data: expedientes, error: expedientesError } = await supabase
        .from("expedientes")
        .select("id")
        .eq("juzgado_id", id)
        .limit(1)

      if (expedientesError) throw expedientesError

      if (expedientes && expedientes.length > 0) {
        toast({
          title: "No se puede eliminar",
          description: "Este juzgado está siendo utilizado en uno o más expedientes.",
          variant: "destructive",
        })
        setIsDeleting(false)
        return
      }

      // Eliminar de la tabla juzgados
      const { error: deleteJuzgadoError } = await supabase.from("juzgados").delete().eq("id", id)

      if (deleteJuzgadoError) throw deleteJuzgadoError

      // Eliminar de la tabla personas
      const { error: deletePersonaError } = await supabase.from("personas").delete().eq("id", id)

      if (deletePersonaError) throw deletePersonaError

      toast({
        title: "Juzgado eliminado",
        description: "El juzgado ha sido eliminado correctamente",
      })

      router.refresh()
    } catch (error) {
      console.error("Error al eliminar juzgado:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar el juzgado",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setJuzgadoToDelete(null)
    }
  }

  return (
    <div className="space-y-4">
      <JuzgadosFilter onFilterChange={setFilters} jueces={jueces} secretarios={secretarios} direcciones={direcciones} />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Juez</TableHead>
              <TableHead>Secretario</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredJuzgados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  {juzgados.length === 0
                    ? "No hay juzgados para mostrar"
                    : "No se encontraron juzgados con los filtros aplicados"}
                </TableCell>
              </TableRow>
            ) : (
              filteredJuzgados.map((juzgado) => (
                <TableRow key={juzgado.id}>
                  <TableCell className="font-medium">{juzgado.nombre}</TableCell>
                  <TableCell>{juzgado.nombre_juez || "-"}</TableCell>
                  <TableCell>{juzgado.nombre_secretario || "-"}</TableCell>
                  <TableCell>{juzgado.domicilio}</TableCell>
                  <TableCell>{juzgado.telefono}</TableCell>
                  <TableCell>{juzgado.email}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild size="icon" variant="ghost">
                        <Link href={`/juzgados/${juzgado.id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Ver</span>
                        </Link>
                      </Button>
                      <Button asChild size="icon" variant="ghost">
                        <Link href={`/juzgados/${juzgado.id}/editar`}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => setJuzgadoToDelete(juzgado.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Esto eliminará permanentemente el juzgado y todos sus
                              datos asociados.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => juzgadoToDelete && handleDelete(juzgadoToDelete)}
                              disabled={isDeleting}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {isDeleting ? "Eliminando..." : "Eliminar"}
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
      <div className="text-sm text-muted-foreground">
        Mostrando {filteredJuzgados.length} de {juzgados.length} juzgados
      </div>
    </div>
  )
}
