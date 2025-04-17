"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type Expediente = {
  id: string
  numero: string
  fecha_creacion: string
  estados: {
    nombre: string
    color: string
  }[]
}

export function RecentExpedientes() {
  const [expedientes, setExpedientes] = useState<Expediente[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchExpedientes() {
      try {
        const { data, error } = await supabase
          .from("expedientes")
          .select(`
            id,
            numero,
            fecha_creacion,
            expediente_estados (
              estados_expediente (
                nombre,
                color
              )
            )
          `)
          .order("fecha_creacion", { ascending: false })
          .limit(5)

        if (error) throw error

        // Transformar los datos para facilitar su uso
        const formattedData = data.map((exp) => ({
          id: exp.id,
          numero: exp.numero,
          fecha_creacion: exp.fecha_creacion,
          estados: exp.expediente_estados.map((estado: any) => ({
            nombre: estado.estados_expediente.nombre,
            color: estado.estados_expediente.color,
          })),
        }))

        setExpedientes(formattedData)
      } catch (error) {
        console.error("Error al cargar expedientes recientes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchExpedientes()
  }, [supabase])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expedientes Recientes</CardTitle>
          <CardDescription>Últimos expedientes creados o actualizados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (expedientes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expedientes Recientes</CardTitle>
          <CardDescription>Últimos expedientes creados o actualizados</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No hay expedientes recientes</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expedientes Recientes</CardTitle>
        <CardDescription>Últimos expedientes creados o actualizados</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {expedientes.map((expediente) => (
            <div key={expediente.id} className="flex items-center justify-between">
              <div>
                <Link href={`/expedientes/${expediente.id}`} className="font-medium hover:underline">
                  Expediente {expediente.numero}
                </Link>
                <p className="text-sm text-muted-foreground">{formatDate(expediente.fecha_creacion)}</p>
              </div>
              <div className="flex gap-2">
                {expediente.estados.slice(0, 2).map((estado, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    style={{
                      backgroundColor: estado.color ? `${estado.color}20` : undefined,
                      color: estado.color,
                      borderColor: estado.color,
                    }}
                  >
                    {estado.nombre}
                  </Badge>
                ))}
                {expediente.estados.length > 2 && <Badge variant="outline">+{expediente.estados.length - 2}</Badge>}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
