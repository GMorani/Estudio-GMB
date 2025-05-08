"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, WifiOff, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useOfflineService } from "@/lib/offline-service"

export function ExpedientesFilter({ onFilterChange }: { onFilterChange?: (filters: any) => void }) {
  const { state, service } = useOfflineService()
  const [loadingOptions, setLoadingOptions] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Obtener parámetros de búsqueda actuales
  const numero = searchParams.get("numero") || ""
  const persona = searchParams.get("persona") || "all"
  const estado = searchParams.get("estado") || "all"
  const tipo = searchParams.get("tipo") || "activos"
  const ordenarPor = searchParams.get("ordenarPor") || "fecha_inicio"
  const ordenAscendente = searchParams.get("ordenAscendente") === "true"

  // Estado local para los filtros
  const [numeroFilter, setNumeroFilter] = useState(numero)
  const [personaFilter, setPersonaFilter] = useState(persona)
  const [estadoFilter, setEstadoFilter] = useState(estado)

  // Estado para las opciones
  const [personas, setPersonas] = useState<{ id: string; nombre: string }[]>([])
  const [estados, setEstados] = useState<{ id: string; nombre: string }[]>([])

  // Cargar opciones desde el servicio offline
  useEffect(() => {
    async function loadOptions() {
      setLoadingOptions(true)
      try {
        // Obtener clientes del servicio offline
        const clientes = service.getCachedData<any>("clientes")
        if (clientes.length > 0) {
          setPersonas(
            clientes.map((cliente: any) => ({
              id: cliente.id,
              nombre: cliente.nombre,
            })),
          )
        }

        // Obtener estados del servicio offline
        const estados = service.getCachedData<any>("estados")
        if (estados.length > 0) {
          setEstados(
            estados.map((estado: any) => ({
              id: estado.id,
              nombre: estado.nombre,
            })),
          )
        }

        // Si no hay datos y estamos online, intentar sincronizar
        if ((clientes.length === 0 || estados.length === 0) && state?.isOnline) {
          await service.syncData()
        }
      } catch (err) {
        console.error("Error al cargar opciones:", err)
      } finally {
        setLoadingOptions(false)
      }
    }

    loadOptions()
  }, [service, state?.isOnline, state?.lastSyncTime])

  // Actualizar la URL con los parámetros de búsqueda
  const applyFilters = () => {
    const params = new URLSearchParams()

    if (numeroFilter) params.set("numero", numeroFilter)
    if (personaFilter !== "all") params.set("persona", personaFilter)
    if (estadoFilter !== "all") params.set("estado", estadoFilter)

    // Mantener los otros parámetros
    params.set("tipo", tipo)
    params.set("ordenarPor", ordenarPor)
    params.set("ordenAscendente", String(ordenAscendente))

    // Si hay una función de callback para cambios de filtro, llamarla
    if (onFilterChange) {
      onFilterChange({
        numero: numeroFilter,
        persona: personaFilter,
        estado: estadoFilter,
        tipo,
        ordenarPor,
        ordenAscendente,
      })
    }

    router.push(`/expedientes?${params.toString()}`)
  }

  // Forzar sincronización
  const handleSync = async () => {
    if (!state?.isOnline) {
      toast({
        title: "Sin conexión",
        description: "No es posible sincronizar en modo offline.",
        variant: "warning",
      })
      return
    }

    setLoadingOptions(true)
    try {
      await service.forceSyncData()
    } finally {
      setLoadingOptions(false)
    }
  }

  return (
    <div className="space-y-4">
      {!state?.isOnline && (
        <Alert variant="warning" className="bg-amber-50 border-amber-200 text-amber-800">
          <WifiOff className="h-4 w-4 mr-2" />
          <AlertDescription>
            Estás en modo offline. Los filtros funcionarán con datos almacenados localmente.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="numero">Número</Label>
          <Input
            type="text"
            id="numero"
            placeholder="Buscar por número"
            value={numeroFilter}
            onChange={(e) => setNumeroFilter(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="persona">Cliente</Label>
          <Select value={personaFilter} onValueChange={setPersonaFilter} disabled={loadingOptions}>
            <SelectTrigger>
              <SelectValue placeholder={loadingOptions ? "Cargando..." : "Seleccionar cliente"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {personas.map((persona) => (
                <SelectItem key={persona.id} value={persona.id}>
                  {persona.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="estado">Estado</Label>
          <Select value={estadoFilter} onValueChange={setEstadoFilter} disabled={loadingOptions}>
            <SelectTrigger>
              <SelectValue placeholder={loadingOptions ? "Cargando..." : "Seleccionar estado"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {estados.map((estado) => (
                <SelectItem key={estado.id} value={estado.id}>
                  {estado.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleSync}
          disabled={loadingOptions || !state?.isOnline || state?.syncInProgress}
        >
          {state?.syncInProgress ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sincronizando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sincronizar
            </>
          )}
        </Button>

        <Button onClick={applyFilters} disabled={loadingOptions}>
          {loadingOptions && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Aplicar Filtros
        </Button>
      </div>
    </div>
  )
}
