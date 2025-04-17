"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/utils"
import { FileText, AlertCircle, CheckCircle, Clock } from "lucide-react"

type Actividad = {
  id: string
  descripcion: string
  fecha: string
  automatica: boolean
  expediente_id: string
  expediente_numero: string
}

export function RecentActivities() {
  const [actividades, setActividades] = useState<Actividad[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchActividades() {
      try {
        const { data, error } = await supabase
          .from("actividades_expediente")
          .select(`
            id,
            descripcion,
            fecha,
            automatica,
            expediente_id,
            expedientes (
              numero
            )
          `)
          .order("fecha", { ascending: false })
          .limit(10)

        if (error) throw error

        // Transformar los datos para facilitar su uso
        const formattedData = data.map((act) => ({
          id: act.id,
          descripcion: act.descripcion,
          fecha: act.fecha,
          automatica: act.automatica,
          expediente_id: act.expediente_id,
          expediente_numero: act.expedientes?.numero || "Sin expediente",
        }))

        setActividades(formattedData)
      } catch (error) {
        console.error("Error al cargar actividades recientes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchActividades()
  }, [supabase])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>Últimas actividades registradas en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (actividades.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>Últimas actividades registradas en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No hay actividades recientes</p>
        </CardContent>
      </Card>
    )
  }

  const getActivityIcon = (descripcion: string) => {
    if (descripcion.includes("creado")) return <FileText className="h-6 w-6 text-blue-500" />
    if (descripcion.includes("actualizado")) return <AlertCircle className="h-6 w-6 text-amber-500" />
    if (descripcion.includes("cumplida")) return <CheckCircle className="h-6 w-6 text-green-500" />
    return <Clock className="h-6 w-6 text-gray-500" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
        <CardDescription>Últimas actividades registradas en el sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {actividades.map((actividad) => (
            <div key={actividad.id} className="flex items-start gap-4">
              <div className="mt-1">{getActivityIcon(actividad.descripcion)}</div>
              <div className="space-y-1">
                <p>{actividad.descripcion}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Link href={`/expedientes/${actividad.expediente_id}`} className="hover:underline">
                    Exp. {actividad.expediente_numero}
                  </Link>
                  <span>•</span>
                  <span>{formatDate(actividad.fecha)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
