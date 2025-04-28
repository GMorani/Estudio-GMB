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
  const [debugInfo, setDebugInfo] = useState<string>("")

  useEffect(() => {
    async function fetchCapitalTotal() {
      try {
        setLoading(true)
        const supabase = createClientSupabase()

        // Obtener todos los expedientes
        const { data, error } = await supabase.from("expedientes").select("*")

        if (error) throw error

        if (!data || data.length === 0) {
          console.log("No hay expedientes para calcular")
          setCapitalTotal(0)
          return
        }

        console.log(`Procesando ${data.length} expedientes`)

        // IMPORTANTE: Este es el campo principal identificado para el cálculo
        // Modifica esta variable si necesitas cambiar el campo utilizado
        const campoPrincipal = "capital_reclamado"

        // Campos de respaldo en orden de prioridad (por si el campo principal no existe)
        const camposRespaldo = ["monto_reclamado", "monto", "valor", "importe", "capital"]

        let total = 0
        let expedientesContados = 0

        // Procesar cada expediente
        data.forEach((expediente) => {
          // Primero intentar con el campo principal
          if (expediente[campoPrincipal] !== undefined && expediente[campoPrincipal] !== null) {
            let valor = expediente[campoPrincipal]

            // Convertir a número si es string
            if (typeof valor === "string") {
              valor = valor.replace(/[^\d.,]/g, "").replace(/,/g, ".")
            }

            const monto = Number.parseFloat(valor)
            if (!isNaN(monto) && monto > 0) {
              total += monto
              expedientesContados++
              return // Continuar con el siguiente expediente
            }
          }

          // Si el campo principal no tiene un valor válido, intentar con los campos de respaldo
          for (const campo of camposRespaldo) {
            if (expediente[campo] !== undefined && expediente[campo] !== null) {
              let valor = expediente[campo]

              // Convertir a número si es string
              if (typeof valor === "string") {
                valor = valor.replace(/[^\d.,]/g, "").replace(/,/g, ".")
              }

              const monto = Number.parseFloat(valor)
              if (!isNaN(monto) && monto > 0) {
                total += monto
                expedientesContados++
                break // Usar solo el primer campo válido encontrado
              }
            }
          }
        })

        console.log(`Capital total calculado: ${total} de ${expedientesContados} expedientes`)
        setCapitalTotal(total)
      } catch (err) {
        console.error("Error al calcular capital:", err)
        // Incluso con error, establecer el capital en 0 para que se muestre algo
        setCapitalTotal(0)
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
          ) : (
            <p className="text-3xl font-bold">{formatCurrency(capitalTotal || 0)}</p>
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
