"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createClientClient } from "@/lib/supabase-client"

interface Mediador {
  id: number
  nombre: string
  matricula: string
  telefono: string
  email: string
  domicilio: string
}

interface MediadoresTableProps {
  mediadores: Mediador[]
}

export function MediadoresTable({ mediadores }: MediadoresTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState<number | null>(null)

  const eliminarMediador = async (id: number) => {
    if (isDeleting) return

    setIsDeleting(id)
    const supabase = createClientClient()

    try {
      const { error } = await supabase.from("mediadores").delete().eq("id", id)

      if (error) {
        throw error
      }

      toast({
        title: "Mediador eliminado",
        description: "El mediador ha sido eliminado correctamente.",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error al eliminar",
        description: error.message || "Ha ocurrido un error al eliminar el mediador.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Matrícula</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mediadores.map((mediador) => (
            <TableRow key={mediador.id}>
              <TableCell className="font-medium">{mediador.nombre}</TableCell>
              <TableCell>{mediador.matricula}</TableCell>
              <TableCell>{mediador.telefono}</TableCell>
              <TableCell>{mediador.email}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menú</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/mediadores/${mediador.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalles
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/mediadores/${mediador.id}/editar`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => eliminarMediador(mediador.id)}
                      disabled={isDeleting === mediador.id}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {isDeleting === mediador.id ? "Eliminando..." : "Eliminar"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
