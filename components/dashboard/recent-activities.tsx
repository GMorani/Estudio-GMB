"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { formatDate } from "@/lib/utils"
import { AlertCircle, Activity } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function RecentActivities() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tableExists, setTableExists] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchActivities() {
      try {
        setLoading(true)

        // Verificar si la tabla actividades existe
        const { error: tableCheckError } = await supabase.from("actividades").select("id").limit(1)

        if (tableCheckError && tableCheckError.message.includes("does not exist")) {
          console.log("La tabla 'actividades' no existe en la base de datos")
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
          .from("actividades")
          .select("*, expedientes(*)")
          .order("fecha", { ascending: false })
          .limit(5)

        if (error) {
          console.error("Error fetching activities:", error)
          setError(error.message)
        } else {
          setActivities(data || [])
        }
      } catch (err) {
        console.error("Error fetching activities:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [supabase])

  if (!tableExists) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>Últimas actividades registradas en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Tabla no encontrada</AlertTitle>
            <AlertDescription>
              La tabla 'actividades' no existe en la base de datos. Esta funcionalidad requiere que la tabla esté
              creada.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>Últimas actividades registradas en el sistema</CardDescription>
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
        <CardTitle>Actividad Reciente</CardTitle>
        <CardDescription>Últimas actividades registradas en el sistema</CardDescription>
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
        ) : activities.length === 0 ? (
          <Alert>
            <Activity className="h-4 w-4" />
            <AlertTitle>Sin actividades</AlertTitle>
            <AlertDescription>No hay actividades registradas en el sistema.</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              // Obtener información del expediente si está disponible
              const expedienteInfo = activity.expedientes
                ? `Exp. #${activity.expedientes.numero || activity.expedientes.referencia || activity.expedientes.id || "N/A"}`
                : "Sin expediente"

              return (
                <div key={activity.id} className="flex items-start space-x-4 border-b pb-4 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium">{activity.descripcion || "Sin descripción"}</p>
                    <p className="text-sm text-muted-foreground">
                      {expedienteInfo} - Fecha: {formatDate(activity.fecha)}
                    </p>
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

export default RecentActivities
