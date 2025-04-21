"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { formatDate } from "@/lib/utils"
import { AlertCircle, CheckCircle2, PlusCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export function ProximasTareas() {
  const [tareas, setTareas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tableExists, setTableExists] = useState(true)
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchTareas() {
      try {
        setLoading(true)

        // Verificar si la tabla tareas existe
        const { error: tableCheckError } = await supabase.from("tareas").select("id").limit(1)

        if (tableCheckError && tableCheckError.message.includes("does not exist")) {
          console.log("La tabla 'tareas' no existe en la base de datos")
          setTableExists(false)
          setLoading(false)
          return
        } else if (tableCheckError) {
          console.error("Error checking table:", tableCheckError)
          setError(tableCheckError.message)
          setLoading(false)
          return
        }

        // Si llegamos aquí, la tabla existe
        const { data, error } = await supabase
          .from("tareas")
          .select("*, expedientes(*)")
          .eq("cumplida", false)
          .order("fecha_vencimiento", { ascending: true })
          .limit(5)

        if (error) {
          console.error("Error fetching tareas:", error)
          setError(error.message)
        } else {
          setTareas(data || [])
        }
      } catch (err) {
        console.error("Error fetching tareas:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTareas()
  }, [supabase])

  const handleCreateTable = async () => {
    try {
      // Esta función simula la creación de la tabla
      // En un entorno real, esto debería hacerse a través de migraciones o un panel de administración
      toast({
        title: "Información",
        description: "La creación de tablas debe realizarse desde el panel de Supabase o mediante migraciones.",
      })
    } catch (error) {
      console.error("Error creating table:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear la tabla. Por favor, contacte al administrador.",
      })
    }
  }

  if (!tableExists) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Próximas Tareas</CardTitle>
          <CardDescription>Tareas pendientes más urgentes</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Tabla no encontrada</AlertTitle>
            <AlertDescription>
              La tabla 'tareas' no existe en la base de datos. Esta funcionalidad requiere que la tabla esté creada.
            </AlertDescription>
          </Alert>
          <div className="flex justify-center">
            <Button variant="outline" onClick={handleCreateTable} className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              <span>Información sobre creación de tablas</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Próximas Tareas</CardTitle>
          <CardDescription>Tareas pendientes más urgentes</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximas Tareas</CardTitle>
        <CardDescription>Tareas pendientes más urgentes</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : tareas.length === 0 ? (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>¡Todo al día!</AlertTitle>
            <AlertDescription>No hay tareas pendientes en este momento.</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {tareas.map((tarea) => {
              const fechaVencimiento = new Date(tarea.fecha_vencimiento)
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              const isOverdue = fechaVencimiento < today

              // Obtener información del expediente si está disponible
              const expedienteInfo = tarea.expedientes
                ? `Exp. #${tarea.expedientes.numero || tarea.expedientes.referencia || tarea.expedientes.id || "N/A"}`
                : "Sin expediente"

              return (
                <div key={tarea.id} className="flex items-start space-x-4 border-b pb-4 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium">{tarea.descripcion || "Sin descripción"}</p>
                    <p className="text-sm text-muted-foreground">
                      {expedienteInfo} - Vence: {formatDate(tarea.fecha_vencimiento)}
                    </p>
                  </div>
                  <div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        isOverdue ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {isOverdue ? "Vencida" : "Pendiente"}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ProximasTareas
