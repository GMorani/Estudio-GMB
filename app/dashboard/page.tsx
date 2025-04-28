"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClientSupabase } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"

export default function DashboardPage() {
  const [capitalTotal, setCapitalTotal] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any[] | null>(null) // Declare data state

  useEffect(() => {
    async function fetchCapitalTotal() {
      try {
        setLoading(true)
        const supabase = createClientSupabase()

        // Obtener todos los expedientes
        const { data, error } = await supabase.from("expedientes").select("*")

        if (error) throw error

        setData(data) // Store the fetched data

        // Depurar para ver la estructura de los datos
        console.log("Muestra de expedientes:", data.slice(0, 2))

        // Calcular la suma total verificando cada expediente
        let total = 0
        let montoEncontrado = false

        data.forEach((expediente) => {
          // Verificar cada posible nombre de columna para el monto
          let montoValue = null

          // Intentar obtener el valor del monto de diferentes columnas posibles
          if (expediente.monto_reclamado !== undefined && expediente.monto_reclamado !== null) {
            montoValue = expediente.monto_reclamado
            console.log(`Expediente ${expediente.id || "sin ID"}: monto_reclamado = ${montoValue}`)
          } else if (expediente.capital_reclamado !== undefined && expediente.capital_reclamado !== null) {
            montoValue = expediente.capital_reclamado
            console.log(`Expediente ${expediente.id || "sin ID"}: capital_reclamado = ${montoValue}`)
          } else if (expediente.valor !== undefined && expediente.valor !== null) {
            montoValue = expediente.valor
            console.log(`Expediente ${expediente.id || "sin ID"}: valor = ${montoValue}`)
          } else if (expediente.importe !== undefined && expediente.importe !== null) {
            montoValue = expediente.importe
            console.log(`Expediente ${expediente.id || "sin ID"}: importe = ${montoValue}`)
          } else if (expediente.monto !== undefined && expediente.monto !== null) {
            montoValue = expediente.monto
            console.log(`Expediente ${expediente.id || "sin ID"}: monto = ${montoValue}`)
          }

          // Si encontramos un valor, convertirlo a número y sumarlo
          if (montoValue !== null) {
            // Limpiar el valor si es un string (quitar símbolos de moneda, puntos, etc.)
            if (typeof montoValue === "string") {
              montoValue = montoValue.replace(/[^\d.,]/g, "")
              montoValue = montoValue.replace(/,/g, ".")
            }

            const valorNumerico = Number.parseFloat(montoValue)
            if (!isNaN(valorNumerico)) {
              total += valorNumerico
              montoEncontrado = true
              console.log(`Sumando: ${valorNumerico}, Total acumulado: ${total}`)
            }
          }
        })

        if (!montoEncontrado) {
          console.warn("No se encontraron montos válidos en ningún expediente")
          setError("No se encontraron montos en los expedientes")
        } else {
          console.log("Total calculado:", total)
          setCapitalTotal(total)
          setError(null)
        }
      } catch (err) {
        console.error("Error al obtener el capital total:", err)
        setError(`No se pudo calcular el capital total: ${err.message || "Error desconocido"}`)
      } finally {
        setLoading(false)
      }
    }

    fetchCapitalTotal()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido al sistema de gestión del Estudio GMB</p>
      </div>

      {/* Nuevo componente para mostrar el Capital Total Reclamado */}
      <Card className="bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Capital Total Reclamado</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-40" />
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <p className="text-3xl font-bold">
              {formatCurrency(capitalTotal || 0)}
              <span className="text-sm text-muted-foreground ml-2">
                (Total de {capitalTotal ? data?.length || 0 : 0} expedientes)
              </span>
            </p>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="actividades">
        <TabsList>
          <TabsTrigger value="actividades">Actividades Recientes</TabsTrigger>
          <TabsTrigger value="tareas">Tareas Pendientes</TabsTrigger>
          <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
          <TabsTrigger value="clientes">Clientes Recientes</TabsTrigger>
        </TabsList>

        <TabsContent value="actividades" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Actividades Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <p>No hay actividades recientes para mostrar.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tareas" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Tareas Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <p>No hay tareas pendientes para mostrar.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estadisticas" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <p>No hay estadísticas para mostrar.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clientes" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Clientes Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <p>No hay clientes recientes para mostrar.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
