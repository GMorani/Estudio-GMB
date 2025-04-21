"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle, FileText } from "lucide-react"

type Tarea = {
  id: number
  descripcion: string
  fecha_vencimiento: string
  cumplida: boolean
  expediente_id: string
  expedientes: {
    id: string
    numero: string
    autos: string
  }
}

export function TareasTable({ tareas }: { tareas: Tarea[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const [tareasState, setTareasState] = useState<Tarea[]>(tareas)
  const [isLoading, setIsLoading] = useState<Record<number, boolean>>({})

  // Función para marcar una tarea como completada
  const completarTarea = async (tareaId: number, expedienteId: string, descripcion: string) => {
    try {
      setIsLoading((prev) => ({ ...prev, [tareaId]: true }))

      // 1. Actualizar la tarea a cumplida
      const { error: updateError } = await supabase
        .from("tareas_expediente")
        .update({ cumplida: true })
        .eq("id", tareaId)

      if (updateError) throw updateError

      // 2. Registrar la actividad
      const { error: actividadError } = await supabase.from("actividades_expediente").insert({
        expediente_id: expedienteId,
        descripcion: `Tarea cumplida - ${descripcion}`,
        fecha: new Date().toISOString(),
        automatica: true,
      })

      if (actividadError) throw actividadError

      // 3. Actualizar el estado local
      setTareasState((prevTareas) => prevTareas.filter((tarea) => tarea.id !== tareaId))

      toast({
        title: "Tarea completada",
        description: "La tarea ha sido marcada como completada.",
      })
    } catch (error) {
      console.error("Error al completar tarea:", error)
      toast({
        title: "Error",
        description: "No se pudo completar la tarea. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading((prev) => ({ ...prev, [tareaId]: false }))
      router.refresh()
    }
  }

  // Si no hay tareas, mostrar mensaje
  if (tareasState.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <div className="rounded-full bg-primary/10 p-3 mb-4">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-medium mb-2">No hay tareas pendientes</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Todas las tareas han sido completadas. Puedes agregar nuevas tareas desde cada expediente.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tareas pendientes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Estado</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Expediente</TableHead>
              <TableHead className="w-[150px]">Vencimiento</TableHead>
              <TableHead className="w-[100px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tareasState.map((tarea) => {
              // Calcular si la tarea está vencida
              const fechaVencimiento = new Date(tarea.fecha_vencimiento)
              const hoy = new Date()
              const vencida = fechaVencimiento < hoy && !tarea.cumplida

              return (
                <TableRow key={tarea.id}>
                  <TableCell>
                    <Checkbox
                      checked={tarea.cumplida}
                      disabled={isLoading[tarea.id]}
                      onCheckedChange={() => completarTarea(tarea.id, tarea.expediente_id, tarea.descripcion)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{tarea.descripcion}</div>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/expedientes/${tarea.expediente_id}`}
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      <FileText className="h-4 w-4" />
                      <span>{tarea.expedientes.numero}</span>
                    </Link>
                    <div className="text-xs text-muted-foreground truncate max-w-[250px]">
                      {tarea.expedientes.autos}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`${vencida ? "text-destructive font-medium" : ""}`}>
                      {formatDate(tarea.fecha_vencimiento)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isLoading[tarea.id]}
                      onClick={() => completarTarea(tarea.id, tarea.expediente_id, tarea.descripcion)}
                    >
                      {isLoading[tarea.id] ? "Procesando..." : "Completar"}
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
