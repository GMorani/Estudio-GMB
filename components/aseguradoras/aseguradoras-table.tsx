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

type Aseguradora = {
  id: string
  nombre: string
  dni_cuit: string
  telefono: string
  email: string
  domicilio: string
  aseguradoras: {
    id: string
  }
}

export function AseguradorasTable({ aseguradoras: initialAseguradoras }: { aseguradoras: Aseguradora[] }) {
  const [aseguradoras, setAseguradoras] = useState<Aseguradora[]>(initialAseguradoras)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  // Filtrar aseguradoras según término de búsqueda
  const filteredAseguradoras = aseguradoras.filter(
    (aseguradora) =>
      aseguradora.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aseguradora.dni_cuit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aseguradora.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Eliminar aseguradora
  async function eliminarAseguradora(id: string) {
    try {
      // Primero eliminar de la tabla aseguradoras
      const { error: errorAseguradoras } = await supabase.from("aseguradoras").delete().eq("id", id)

      if (errorAseguradoras) throw errorAseguradoras

      // Luego eliminar de la tabla personas
      const { error: errorPersonas } = await supabase.from("personas").delete().eq("id", id)

      if (errorPersonas) throw errorPersonas

      // Actualizar la lista de aseguradoras
      setAseguradoras(aseguradoras.filter((aseguradora) => aseguradora.id !== id))

      toast({
        title: "Aseguradora eliminada",
        description: "La aseguradora ha sido eliminada correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar aseguradora:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la aseguradora. Puede tener expedientes asociados.",
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
            placeholder="Buscar por nombre, CUIT o email..."
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
              <TableHead>CUIT</TableHead>
              <TableHead className="hidden md:table-cell">Teléfono</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAseguradoras.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No se encontraron aseguradoras
                </TableCell>
              </TableRow>
            ) : (
              filteredAseguradoras.map((aseguradora) => (
                <TableRow key={aseguradora.id}>
                  <TableCell className="font-medium">{aseguradora.nombre}</TableCell>
                  <TableCell>{formatDNI(aseguradora.dni_cuit)}</TableCell>
                  <TableCell className="hidden md:table-cell">{formatTelefono(aseguradora.telefono)}</TableCell>
                  <TableCell className="hidden md:table-cell">{aseguradora.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/aseguradoras/${aseguradora.id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Ver</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/aseguradoras/${aseguradora.id}/editar`}>
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
                              Esta acción no se puede deshacer. Se eliminará permanentemente la aseguradora y todas sus
                              relaciones.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => eliminarAseguradora(aseguradora.id)}
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
