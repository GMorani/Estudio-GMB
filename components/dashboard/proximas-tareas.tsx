"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { CalendarClock } from "lucide-react"

export function ProximasTareas() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tableExists, setTableExists] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function checkTableExists() {
      try {
        // Intentar obtener la definición de la tabla para verificar si existe
        const { error } = await supabase.from("tareas").select("id").limit(1)

        if (error && error.message.includes("does not exist")) {
          console.log("La tabla 'tareas' no existe en la base de datos")
          setTableExists(false)
          setLoading(false)
          return false
        }

        return true
      } catch (err) {
        console.error("Error al verificar la tabla:", err)
        setTableExists(false)
        setLoading(false)
        return false
      }
    }

    async function fetchTareas() {
      try {
        setLoading(true)
        setError(null)

        // Primero verificar si la tabla existe
        const exists = await checkTableExists()
        if (!exists) return

        // Si la tabla existe, obtener las tareas
        const { data, error } = await supabase.from("tareas").select("*").order("id", { ascending: false }).limit(5)

        if (error) throw error

        // Aquí procesaríamos los datos si los necesitáramos
        // Por ahora solo actualizamos el estado de carga
        setLoading(false)
      } catch (err: any) {
        console.error("Error fetching tareas:", err.message)
        setError(`Error al cargar tareas: ${err.message}`)
        setLoading(false)
      }
    }

    fetchTareas()
  }, [supabase])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-orange-500" />
          Próximas Tareas
        </CardTitle>
        <CardDescription>Tareas pendientes</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">Cargando...</div>
        ) : !tableExists ? (
          <div className="text-center py-4 text-muted-foreground">
            <p>La tabla de tareas no está configurada.</p>
            <p className="text-sm mt-2">
              Para usar esta funcionalidad, cree la tabla "tareas" en su base de datos Supabase.
            </p>
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">No hay tareas pendientes</div>
        )}
      </CardContent>
    </Card>
  )
}

export default ProximasTareas
