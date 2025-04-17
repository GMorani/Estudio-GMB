"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, Pencil, Trash2, Search } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { formatTelefono } from "@/lib/utils"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"

type Juzgado = {
  id: string
  nombre: string
  dni_cuit: string
  telefono: string
  email: string
  domicilio: string
  juzgados: {
    id: string
  }
}

export function JuzgadosTable({ juzgados: initialJuzgados }: { juzgados: Juzgado[] }) {
  const [juzgados, setJuzgados] = useState<Juzgado[]>(initialJuzgados)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  // Filtrar juzgados según término de búsqueda
  const filteredJuzgados = juzgados.filter(
    (juzgado) =>
      juzgado.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      juzgado.dni_cuit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      juzgado.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      juzgado.domicilio?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Eliminar juzgado
  async function eliminarJuzgado(id: string) {
    try {
      // Primero eliminar de la tabla juzgados
      const { error: errorJuzgados } = await supabase.from("juzgados").delete().eq("id", id)

      if (errorJuzgados) throw errorJuzgados

      // Luego eliminar de la tabla personas
      const { error: errorPersonas } = await supabase.from("personas").delete().eq("id", id)

      if (errorPersonas) throw errorPersonas

      // Actualizar la lista de juzgados
      setJuzgados(juzgados.filter((juzgado) => juzgado.id !== id))

      toast({
        title: "Juzgado eliminado",
        description: "El juzgado ha sido eliminado correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar juzgado:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el juzgado. Puede tener expedientes asociados.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nombre, dirección o teléfono..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead className="hidden md:table-cell">Dirección</TableHead>
              <TableHead className="hidden md:table-cell">Teléfono</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredJuzgados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No se encontraron juzgados
                </TableCell>
              </TableRow>
            ) : (
              filteredJuzgados.map((juzgado) => (
                <TableRow key={juzgado.id}>
                  <TableCell className="font-medium">{juzgado.nombre}</TableCell>
                  <TableCell className="hidden md:table-cell">{juzgado.domicilio}</TableCell>
                  <TableCell className="hidden md:table-cell">{formatTelefono(juzgado.telefono)}</TableCell>
                  <TableCell className="hidden md:table-cell">{juzgado.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/juzgados/${juzgado.id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Ver</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/juzgados/${juzgado.id}/editar`}>
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
                              Esta acción no se puede deshacer. Se eliminará permanentemente el juzgado y todas sus
                              relaciones.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => eliminarJuzgado(juzgado.id)}
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
