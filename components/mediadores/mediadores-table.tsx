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
import { formatDNI, formatTelefono } from "@/lib/utils"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"

type Mediador = {
  id: string
  nombre: string
  dni_cuit: string
  telefono: string
  email: string
  domicilio: string
  mediadores: {
    id: string
  }
}

export function MediadoresTable({ mediadores: initialMediadores }: { mediadores: Mediador[] }) {
  const [mediadores, setMediadores] = useState<Mediador[]>(initialMediadores)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  // Filtrar mediadores según término de búsqueda
  const filteredMediadores = mediadores.filter(
    (mediador) =>
      mediador.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mediador.dni_cuit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mediador.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mediador.domicilio?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Eliminar mediador
  async function eliminarMediador(id: string) {
    try {
      // Primero eliminar de la tabla mediadores
      const { error: errorMediadores } = await supabase.from("mediadores").delete().eq("id", id)

      if (errorMediadores) throw errorMediadores

      // Luego eliminar de la tabla personas
      const { error: errorPersonas } = await supabase.from("personas").delete().eq("id", id)

      if (errorPersonas) throw errorPersonas

      // Actualizar la lista de mediadores
      setMediadores(mediadores.filter((mediador) => mediador.id !== id))

      toast({
        title: "Mediador eliminado",
        description: "El mediador ha sido eliminado correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar mediador:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el mediador. Puede tener expedientes asociados.",
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
            placeholder="Buscar por nombre, DNI o email..."
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
              <TableHead>DNI</TableHead>
              <TableHead className="hidden md:table-cell">Teléfono</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMediadores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No se encontraron mediadores
                </TableCell>
              </TableRow>
            ) : (
              filteredMediadores.map((mediador) => (
                <TableRow key={mediador.id}>
                  <TableCell className="font-medium">{mediador.nombre}</TableCell>
                  <TableCell>{formatDNI(mediador.dni_cuit)}</TableCell>
                  <TableCell className="hidden md:table-cell">{formatTelefono(mediador.telefono)}</TableCell>
                  <TableCell className="hidden md:table-cell">{mediador.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/mediadores/${mediador.id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Ver</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/mediadores/${mediador.id}/editar`}>
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
                              Esta acción no se puede deshacer. Se eliminará permanentemente el mediador y todas sus
                              relaciones.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => eliminarMediador(mediador.id)}
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
