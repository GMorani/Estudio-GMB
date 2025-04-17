"use client"

import { useState, useEffect } from "react"
import { addDays, format, startOfWeek, isSameDay, subWeeks, addWeeks } from "date-fns"
import { es } from "date-fns/locale"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

type Tarea = {
  id: string
  descripcion: string
  fecha_vencimiento: string
  prioridad: string
  cumplida: boolean
  expediente_id: string
  expediente_numero?: string
}

export function CalendarioSemanal() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const supabase = createClientComponentClient()

  // Obtener el primer día de la semana actual (lunes)
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }) // 1 = lunes

  // Crear un array con los 7 días de la semana
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i))

  // Cargar tareas para la semana actual
  useEffect(() => {
    async function fetchTareas() {
      setIsLoading(true)

      try {
        // Calcular el rango de fechas para la semana
        const startDateStr = format(startDate, "yyyy-MM-dd")
        const endDateStr = format(addDays(startDate, 6), "yyyy-MM-dd")

        // Consultar tareas en el rango de fechas
        const { data, error } = await supabase
          .from("tareas_expediente")
          .select(`
            id,
            descripcion,
            fecha_vencimiento,
            prioridad,
            cumplida,
            expediente_id,
            expedientes (numero)
          `)
          .gte("fecha_vencimiento", startDateStr)
          .lte("fecha_vencimiento", endDateStr)
          .order("fecha_vencimiento", { ascending: true })

        if (error) throw error

        // Transformar los datos para incluir el número de expediente
        const tareasConExpediente = data.map((tarea) => ({
          ...tarea,
          expediente_numero: tarea.expedientes?.numero,
        }))

        setTareas(tareasConExpediente)
      } catch (error) {
        console.error("Error al cargar tareas:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las tareas. Por favor, inténtalo de nuevo.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTareas()
  }, [supabase, startDate, toast])

  // Navegar a la semana anterior
  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1))

  // Navegar a la semana siguiente
  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1))

  // Volver a la semana actual
  const goToToday = () => setCurrentDate(new Date())

  // Filtrar tareas por día
  const getTareasByDay = (date: Date) => {
    return tareas.filter((tarea) => {
      const tareaDate = new Date(tarea.fecha_vencimiento)
      return isSameDay(tareaDate, date)
    })
  }

  // Obtener color según prioridad
  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad?.toLowerCase()) {
      case "alta":
        return "bg-red-100 border-red-300 text-red-700"
      case "normal":
        return "bg-blue-100 border-blue-300 text-blue-700"
      case "baja":
        return "bg-green-100 border-green-300 text-green-700"
      default:
        return "bg-gray-100 border-gray-300 text-gray-700"
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Controles de navegación */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={goToToday}>
            Hoy
          </Button>
        </div>

        <h2 className="text-lg font-semibold">
          {format(startDate, "d 'de' MMMM", { locale: es })} -{" "}
          {format(addDays(startDate, 6), "d 'de' MMMM yyyy", { locale: es })}
        </h2>

        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>Vista mensual</span>
        </Button>
      </div>

      {/* Calendario semanal */}
      <div className="grid grid-cols-7 gap-4 flex-1">
        {weekDays.map((day) => {
          const dayTareas = getTareasByDay(day)
          const isToday = isSameDay(day, new Date())

          return (
            <div key={day.toString()} className="flex flex-col h-full">
              {/* Cabecera del día */}
              <div
                className={`text-center p-2 rounded-t-md ${isToday ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                <div className="font-medium">{format(day, "EEEE", { locale: es })}</div>
                <div className={`text-2xl font-bold ${isToday ? "text-primary-foreground" : ""}`}>
                  {format(day, "d")}
                </div>
              </div>

              {/* Contenido del día */}
              <Card className="flex-1">
                <CardContent className="p-2 h-full overflow-y-auto">
                  {isLoading ? (
                    // Esqueletos durante la carga
                    Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="mb-2">
                        <Skeleton className="h-16 w-full" />
                      </div>
                    ))
                  ) : dayTareas.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No hay tareas</p>
                  ) : (
                    // Lista de tareas del día
                    <div className="space-y-2">
                      {dayTareas.map((tarea) => (
                        <Link href={`/expedientes/${tarea.expediente_id}`} key={tarea.id} className="block">
                          <div
                            className={`p-2 text-sm border rounded-md ${getPrioridadColor(tarea.prioridad)} ${
                              tarea.cumplida ? "opacity-60 line-through" : ""
                            }`}
                          >
                            <div className="font-medium">{tarea.descripcion}</div>
                            {tarea.expediente_numero && (
                              <div className="text-xs mt-1">Exp: {tarea.expediente_numero}</div>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
}
