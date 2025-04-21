"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { MoreHorizontal, Eye, Edit, Trash, CheckCircle } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export interface Tarea {
  id: number
  descripcion: string
  fecha_vencimiento: string
  cumplida: boolean
  expediente_id?: number
  expediente?: {
    id: number
    numero?: string
    autos?: string
  }
}

interface TareasTableProps {
  tareas?: Tarea[]
  onTareaUpdated?: () => void
}

export function TareasTable({ tareas = [], onTareaUpdated }: TareasTableProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState<number | null>(null)
  const supabase = createClientComponentClient()

  const handleViewTarea = (id: number) => {
    router.push(`/tareas/${id}`)
  }

  const handleEditTarea = (id: number) => {
    router.push(`/tareas/${id}/editar`)
  }

  const handleDeleteTarea = async (id: number) => {
    if (confirm("¿Está seguro de que desea eliminar esta tarea?")) {
      try {
        const { error } = await supabase.from("tareas_expediente").delete().eq("id", id)

        if (error) throw error

        if (onTareaUpdated) onTareaUpdated()
      } catch (error) {
        console.error("Error al eliminar la tarea:", error)
        alert("Error al eliminar la tarea. Por favor, intente nuevamente.")
      }
    }
  }

  const handleToggleCumplida = async (id: number, currentStatus: boolean) => {
    setIsUpdating(id)
    try {
      const { error } = await supabase.from("tareas_expediente").update({ cumplida: !currentStatus }).eq("id", id)

      if (error) throw error

      if (onTareaUpdated) onTareaUpdated()
    } catch (error) {
      console.error("Error al actualizar el estado de la tarea:", error)
      alert("Error al actualizar el estado de la tarea. Por favor, intente nuevamente.")
    } finally {
      setIsUpdating(null)
    }
  }

  if (!tareas || tareas.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No hay tareas para mostrar.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Estado</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Expediente</TableHead>
            <TableHead>Vencimiento</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tareas.map((tarea) => (
            <TableRow key={tarea.id}>
              <TableCell>
                <Checkbox
                  checked={tarea.cumplida}
                  disabled={isUpdating === tarea.id}
                  onCheckedChange={() => handleToggleCumplida(tarea.id, tarea.cumplida)}
                />
              </TableCell>
              <TableCell>
                <div className="font-medium">{tarea.descripcion}</div>
                {tarea.cumplida && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Cumplida
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {tarea.expediente ? (
                  <Button
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => router.push(`/expedientes/${tarea.expediente_id}`)}
                  >
                    {tarea.expediente.numero || tarea.expediente.autos || `#${tarea.expediente.id}`}
                  </Button>
                ) : (
                  <span className="text-muted-foreground">Sin expediente</span>
                )}
              </TableCell>
              <TableCell>
                <div
                  className={`font-medium ${new Date(tarea.fecha_vencimiento) < new Date() && !tarea.cumplida ? "text-red-600" : ""}`}
                >
                  {formatDate(tarea.fecha_vencimiento)}
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menú</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewTarea(tarea.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver detalles
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditTarea(tarea.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteTarea(tarea.id)} className="text-red-600">
                      <Trash className="mr-2 h-4 w-4" />
                      Eliminar
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

// Exportación por defecto para mantener compatibilidad
export default TareasTable
