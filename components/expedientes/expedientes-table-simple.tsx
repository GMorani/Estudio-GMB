"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw, FileText, AlertTriangle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Tipo para los expedientes
interface Expediente {
  id: string
  numero_expediente: string
  autos: string
  estado: string
  fecha_alta: string
}

// Componente principal
export function ExpedientesTableSimple({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const [expedientes, setExpedientes] = useState<Expediente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const { toast } = useToast()

  // Cargar datos al inicio
  useEffect(() => {
    // Intentar cargar desde localStorage primero
    try {
      const cachedData = localStorage.getItem("expedientes_data")
      if (cachedData) {
        setExpedientes(JSON.parse(cachedData))
        setLoading(false)
      }
    } catch (err) {
      console.error("Error al cargar datos de caché:", err)
    }

    // Intentar cargar datos frescos
    loadExpedientes()
  }, [searchParams])

  // Función para cargar expedientes
  const loadExpedientes = async () => {
    if (isRetrying) return

    setLoading(true)
    setError(null)

    try {
      // Importar dinámicamente para evitar errores durante la carga inicial
      const { createClientComponentClient } = await import("@supabase/auth-helpers-nextjs")
      const supabase = createClientComponentClient()

      // Construir la consulta
      let query = supabase
        .from("expedientes")
        .select(`
          id,
          numero_expediente,
          autos,
          estado,
          fecha_alta
        `)
        .order("fecha_alta", { ascending: false })

      // Aplicar filtros si existen
      if (searchParams.estado) {
        query = query.eq("estado", searchParams.estado)
      }

      // Ejecutar la consulta
      const { data, error } = await query.limit(50)

      if (error) throw error

      // Actualizar el estado
      setExpedientes(data || [])
      setIsConnected(true)

      // Guardar en localStorage para uso offline
      localStorage.setItem("expedientes_data", JSON.stringify(data || []))
    } catch (err: any) {
      console.error("Error al cargar expedientes:", err)
      setError(err.message || "Error al cargar expedientes")
      setIsConnected(false)

      // Solo mostrar toast si no hay datos en caché
      if (expedientes.length === 0) {
        toast({
          title: "Error de conexión",
          description: "No se pudieron cargar los expedientes. Se muestran datos en caché si están disponibles.",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
      setIsRetrying(false)
    }
  }

  // Función para reintentar la carga
  const handleRetry = () => {
    setIsRetrying(true)
    loadExpedientes()
  }

  // Si no hay datos y hay un error, mostrar mensaje de error
  if (expedientes.length === 0 && error) {
    return (
      <Card className="p-6 text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-amber-500" />
        </div>
        <h2 className="text-xl font-semibold mb-2">No se pudieron cargar los expedientes</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={handleRetry} disabled={isRetrying}>
          {isRetrying ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Intentando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </>
          )}
        </Button>
      </Card>
    )
  }

  // Si está cargando y no hay datos en caché, mostrar esqueletos
  if (loading && expedientes.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
              <Skeleton className="h-10 w-[100px]" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  // Renderizar la lista de expedientes
  return (
    <div className="space-y-4">
      {!isConnected && expedientes.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800 text-sm flex items-center mb-4">
          <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>Mostrando datos guardados localmente. </span>
          <Button
            variant="link"
            className="p-0 h-auto text-amber-800 underline ml-1"
            onClick={handleRetry}
            disabled={isRetrying}
          >
            {isRetrying ? "Actualizando..." : "Actualizar ahora"}
          </Button>
        </div>
      )}

      {expedientes.map((expediente) => (
        <Card key={expediente.id} className="p-4 hover:bg-muted/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">
                <Link href={`/expedientes/${expediente.id}`} className="hover:underline">
                  {expediente.autos || "Expediente sin título"}
                </Link>
              </h3>
              <p className="text-sm text-muted-foreground">
                Nº {expediente.numero_expediente} • Estado: {expediente.estado}
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={`/expedientes/${expediente.id}`}>
                <FileText className="h-4 w-4 mr-2" />
                Ver
              </Link>
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
