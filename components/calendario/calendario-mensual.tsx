"use client"

import { useState, useEffect } from "react"
import { format, addMonths, subMonths, isSameDay, isSameMonth, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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

export function CalendarioMensual() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const { toast } = useToast()

  const supabase = createClientComponentClient()

  // Cargar tareas para el mes actual
  useEffect(() => {
    async function fetchTareas() {
      setIsLoading(true)

      try {
        // Calcular el primer y último día del mes
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

        const firstDayStr = format(firstDay, "yyyy-MM-dd")
        const lastDayStr = format(lastDay, "yyyy-MM-dd")

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
          .gte("fecha_vencimiento", firstDayStr)
          .lte("fecha_vencimiento", lastDayStr)
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
  }, [supabase, currentDate, toast])

  // Navegar al mes anterior
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

  // Navegar al mes siguiente
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))

  // Volver al mes actual
  const goToToday = () => setCurrentDate(new Date())

  // Filtrar tareas por día
  const getTareasByDay = (date: Date) => {
    return tareas.filter((tarea) => {
      const tareaDate = parseISO(tarea.fecha_vencimiento)
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

  // Renderizar el contenido del día en el calendario
  const renderDay = (day: Date) => {
    // Solo procesar días del mes actual
    if (!isSameMonth(day, currentDate)) return null

    const dayTareas = getTareasByDay(day)
    if (dayTareas.length === 0) return null

    return (
      <div className="flex justify-center items-center">
        <div className="h-1.5 w-1.5 bg-primary rounded-full"></div>
        <span className="ml-1 text-xs font-medium">{dayTareas.length}</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Controles de navegación */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={goToToday}>
            Hoy
          </Button>
        </div>

        <h2 className="text-lg font-semibold">{format(currentDate, "MMMM yyyy", { locale: es })}</h2>
      </div>

      {/* Calendario mensual */}
      <div className="flex-1">
        {isLoading ? (
          <Skeleton className="h-[500px] w-full" />
        ) : (
          <Calendar
            mode="single"
            selected={selectedDay}
            onSelect={setSelectedDay}
            month={currentDate}
            className="rounded-md border"
            components={{
              DayContent: ({ day }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <div>{format(day, "d")}</div>
                      {renderDay(day)}
                    </div>
                  </PopoverTrigger>

                  {getTareasByDay(day).length > 0 && (
                    <PopoverContent className="w-80 p-0" align="start">
                      <Card>
                        <CardContent className="p-4">
                          <h3 className="font-medium mb-2">{format(day, "EEEE d 'de' MMMM", { locale: es })}</h3>
                          <div className="space-y-2">
                            {getTareasByDay(day).map((tarea) => (
                              <div
                                key={tarea.id}
                                className={`p-2 text-sm border rounded-md ${getPrioridadColor(tarea.prioridad)} ${
                                  tarea.cumplida ? "opacity-60 line-through" : ""
                                }`}
                              >
                                <div className="font-medium">{tarea.descripcion}</div>
                                {tarea.expediente_numero && (
                                  <div className="text-xs mt-1">Exp: {tarea.expediente_numero}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </PopoverContent>
                  )}
                </Popover>
              ),
            }}
          />
        )}
      </div>
    </div>
  )
}
