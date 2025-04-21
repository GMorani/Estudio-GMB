"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { AlertCircle, Users } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function RecentClientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tableExists, setTableExists] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchClientes() {
      try {
        setLoading(true)

        // Verificar si la tabla personas existe
        const { error: tableCheckError } = await supabase.from("personas").select("id").limit(1)

        if (tableCheckError && tableCheckError.message.includes("does not exist")) {
          console.log("La tabla 'personas' no existe en la base de datos")
          setTableExists(false)
          setLoading(false)
          return
        } else if (tableCheckError) {
          console.error("Error checking table:", tableCheckError)
          setError(tableCheckError.message)
          setLoading(false)
          return
        }

        // Verificar si la tabla clientes existe
        const { error: clientesTableCheckError } = await supabase.from("clientes").select("id").limit(1)

        if (clientesTableCheckError && !clientesTableCheckError.message.includes("does not exist")) {
          console.error("Error checking clientes table:", clientesTableCheckError)
          setError(clientesTableCheckError.message)
          setLoading(false)
          return
        }

        // Si la tabla clientes existe, usamos la relación, si no, solo usamos personas
        let query
        if (!clientesTableCheckError) {
          // La tabla clientes existe
          query = supabase.from("personas").select("*, clientes(*)").order("id", { ascending: false }).limit(5)
        } else {
          // Solo usamos la tabla personas
          query = supabase.from("personas").select("*").order("id", { ascending: false }).limit(5)
        }

        const { data, error } = await query

        if (error) {
          console.error("Error fetching clientes:", error)
          setError(error.message)
        } else {
          setClientes(data || [])
        }
      } catch (err) {
        console.error("Error fetching clientes:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchClientes()
  }, [supabase])

  if (!tableExists) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Clientes Recientes</CardTitle>
          <CardDescription>Últimos clientes registrados en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Tabla no encontrada</AlertTitle>
            <AlertDescription>
              La tabla 'personas' no existe en la base de datos. Esta funcionalidad requiere que la tabla esté creada.
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
          <CardTitle>Clientes Recientes</CardTitle>
          <CardDescription>Últimos clientes registrados en el sistema</CardDescription>
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
        <CardTitle>Clientes Recientes</CardTitle>
        <CardDescription>Últimos clientes registrados en el sistema</CardDescription>
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
        ) : clientes.length === 0 ? (
          <Alert>
            <Users className="h-4 w-4" />
            <AlertTitle>Sin clientes</AlertTitle>
            <AlertDescription>No hay clientes registrados en el sistema.</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {clientes.map((cliente) => {
              // Determinar si es cliente o solo persona
              const esCliente = cliente.clientes && cliente.clientes.id

              return (
                <div key={cliente.id} className="flex items-start space-x-4 border-b pb-4 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium">
                      {cliente.nombre} {cliente.apellidos}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {esCliente ? "Cliente" : "Persona"} - {cliente.email || "Sin email"}
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

export default RecentClientes
