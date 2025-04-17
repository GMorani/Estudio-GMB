"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate, formatDNI, formatTelefono } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type Cliente = {
  id: string
  nombre: string
  dni_cuit: string
  telefono: string
  email: string
  fecha_creacion: string | null
}

export function RecentClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchClientes() {
      try {
        const { data, error } = await supabase
          .from("personas")
          .select(`
            id,
            nombre,
            dni_cuit,
            telefono,
            email
          `)
          .eq("tipo_id", 1) // Tipo cliente
          .order("id", { ascending: false }) // Ordenar por ID en lugar de created_at
          .limit(5)

        if (error) throw error

        // Transformar los datos para facilitar su uso
        const formattedData = data.map((cliente) => ({
          id: cliente.id,
          nombre: cliente.nombre,
          dni_cuit: cliente.dni_cuit,
          telefono: cliente.telefono,
          email: cliente.email,
          fecha_creacion: null, // No tenemos fecha de creación
        }))

        setClientes(formattedData)
      } catch (error) {
        console.error("Error al cargar clientes recientes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchClientes()
  }, [supabase])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Clientes Recientes</CardTitle>
          <CardDescription>Últimos clientes registrados en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
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

  if (clientes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Clientes Recientes</CardTitle>
          <CardDescription>Últimos clientes registrados en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No hay clientes recientes</p>
        </CardContent>
      </Card>
    )
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clientes Recientes</CardTitle>
        <CardDescription>Últimos clientes registrados en el sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {clientes.map((cliente) => (
            <div key={cliente.id} className="flex items-center gap-4">
              <Avatar>
                <AvatarFallback className="bg-blue-100 text-blue-800">{getInitials(cliente.nombre)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Link href={`/clientes/${cliente.id}`} className="font-medium hover:underline">
                  {cliente.nombre}
                </Link>
                <div className="flex flex-wrap gap-x-4 text-sm text-muted-foreground">
                  <span>{formatDNI(cliente.dni_cuit)}</span>
                  <span>{formatTelefono(cliente.telefono)}</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {cliente.fecha_creacion ? formatDate(cliente.fecha_creacion) : ""}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
