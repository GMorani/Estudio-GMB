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

// Modificar el tipo Abogado para que no incluya campos que podrían no existir
type Abogado = {
  id: string
  nombre: string
  dni_cuit: string
  telefono: string
  email: string
  domicilio: string
  abogados: {
    id: string
  }
}

export function AbogadosTable({ abogados: initialAbogados }: { abogados: Abogado[] }) {
  const [abogados, setAbogados] = useState<Abogado[]>(initialAbogados)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  // Modificar la función de filtrado para que no busque en campos que podrían no existir
  const filteredAbogados = abogados.filter(
    (abogado) =>
      abogado.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      abogado.dni_cuit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      abogado.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Eliminar abogado
  async function eliminarAbogado(id: string) {
    try {
      // Primero eliminar de la tabla abogados
      const { error: errorAbogados } = await supabase.from("abogados").delete().eq("id", id)

      if (errorAbogados) throw errorAbogados

      // Luego eliminar de la tabla personas
      const { error: errorPersonas } = await supabase.from("personas").delete().eq("id", id)

      if (errorPersonas) throw errorPersonas

      // Actualizar la lista de abogados
      setAbogados(abogados.filter((abogado) => abogado.id !== id))

      toast({
        title: "Abogado eliminado",
        description: "El abogado ha sido eliminado correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar abogado:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el abogado. Puede tener expedientes asociados.",
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
            placeholder="Buscar por nombre, DNI, matrícula o especialidad..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          {/* Modificar la tabla para que no muestre columnas que dependen de campos que podrían no existir */}
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
            {filteredAbogados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No se encontraron abogados
                </TableCell>
              </TableRow>
            ) : (
              filteredAbogados.map((abogado) => (
                <TableRow key={abogado.id}>
                  <TableCell className="font-medium">{abogado.nombre}</TableCell>
                  <TableCell>{formatDNI(abogado.dni_cuit)}</TableCell>
                  <TableCell className="hidden md:table-cell">{formatTelefono(abogado.telefono)}</TableCell>
                  <TableCell className="hidden md:table-cell">{abogado.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/abogados/${abogado.id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Ver</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/abogados/${abogado.id}/editar`}>
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
                              Esta acción no se puede deshacer. Se eliminará permanentemente el abogado y todas sus
                              relaciones.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => eliminarAbogado(abogado.id)}
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
