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
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"

type Perito = {
  id: string
  nombre: string
  telefono?: string
  email?: string
  especialidad?: string
  direccion?: string
  notas?: string
}

export function PeritosTable({ peritos: initialPeritos }: { peritos: Perito[] }) {
  const [peritos, setPeritos] = useState<Perito[]>(initialPeritos)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  // Filtrar peritos según término de búsqueda
  const filteredPeritos = peritos.filter(
    (perito) =>
      perito.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perito.especialidad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perito.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perito.direccion?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Eliminar perito
  async function eliminarPerito(id: string) {
    try {
      const { error } = await supabase.from("peritos").delete().eq("id", id)

      if (error) throw error

      // Actualizar la lista de peritos
      setPeritos(peritos.filter((perito) => perito.id !== id))

      toast({
        title: "Perito eliminado",
        description: "El perito ha sido eliminado correctamente",
      })
    } catch (error: any) {
      console.error("Error al eliminar perito:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el perito. Puede tener expedientes asociados.",
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
            placeholder="Buscar por nombre, especialidad o email..."
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
              <TableHead>Especialidad</TableHead>
              <TableHead className="hidden md:table-cell">Teléfono</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPeritos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No se encontraron peritos
                </TableCell>
              </TableRow>
            ) : (
              filteredPeritos.map((perito) => (
                <TableRow key={perito.id}>
                  <TableCell className="font-medium">{perito.nombre}</TableCell>
                  <TableCell>{perito.especialidad || "-"}</TableCell>
                  <TableCell className="hidden md:table-cell">{perito.telefono || "-"}</TableCell>
                  <TableCell className="hidden md:table-cell">{perito.email || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/peritos/${perito.id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Ver</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/peritos/${perito.id}/editar`}>
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
                              Esta acción no se puede deshacer. Se eliminará permanentemente el perito.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => eliminarPerito(perito.id)}
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
