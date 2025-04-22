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

interface Perito {
  id: number
  nombre: string
  especialidad: string
  telefono: string
  email: string
  domicilio: string
}

interface PeritosTableProps {
  peritos: Perito[]
}

export function PeritosTable({ peritos }: PeritosTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState<number | null>(null)

  const eliminarPerito = async (id: number) => {
    if (isDeleting) return

    setIsDeleting(id)
    const supabase = createClientClient()

    try {
      const { error } = await supabase.from("peritos").delete().eq("id", id)

      if (error) {
        throw error
      }

      toast({
        title: "Perito eliminado",
        description: "El perito ha sido eliminado correctamente.",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error al eliminar",
        description: error.message || "Ha ocurrido un error al eliminar el perito.",
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
            <TableHead>Especialidad</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {peritos.map((perito) => (
            <TableRow key={perito.id}>
              <TableCell className="font-medium">{perito.nombre}</TableCell>
              <TableCell>{perito.especialidad}</TableCell>
              <TableCell>{perito.telefono}</TableCell>
              <TableCell>{perito.email}</TableCell>
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
                      <Link href={`/peritos/${perito.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalles
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/peritos/${perito.id}/editar`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => eliminarPerito(perito.id)}
                      disabled={isDeleting === perito.id}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {isDeleting === perito.id ? "Eliminando..." : "Eliminar"}
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
