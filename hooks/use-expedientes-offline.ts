"use client"

import { useState, useEffect, useCallback } from "react"
import { useOfflineService } from "@/lib/offline-service"
import { useToast } from "@/components/ui/use-toast"

// Tipos
export type Expediente = {
  id: string
  numero: string
  autos: string
  estado: string
  fecha_inicio: string
  fecha_alta: string
  juzgado: string
  cliente_id?: string
  cliente_nombre?: string
  estado_id?: string
  juzgado_id?: string
  aseguradora_id?: string
  aseguradora_nombre?: string
  capital_reclamado?: number
  notas?: string
  _modified?: boolean
  _pendingSync?: boolean
}

export type FiltrosExpediente = {
  numero?: string
  persona?: string
  estado?: string
  tipo?: string
  ordenarPor?: string
  ordenAscendente?: boolean
}

// Función para filtrar expedientes
const filtrarExpedientes = (expedientes: Expediente[], filtros: FiltrosExpediente): Expediente[] => {
  return expedientes
    .filter((exp) => {
      // Filtrar por número
      if (filtros.numero && !exp.numero.toLowerCase().includes(filtros.numero.toLowerCase())) {
        return false
      }

      // Filtrar por persona/cliente
      if (filtros.persona && filtros.persona !== "all" && exp.cliente_id !== filtros.persona) {
        return false
      }

      // Filtrar por estado
      if (filtros.estado && filtros.estado !== "all" && exp.estado_id !== filtros.estado) {
        return false
      }

      // Filtrar por tipo (activos/archivados)
      if (filtros.tipo === "activos" && exp.estado === "Finalizado") {
        return false
      }
      if (filtros.tipo === "archivados" && exp.estado !== "Finalizado") {
        return false
      }

      return true
    })
    .sort((a, b) => {
      // Ordenar según el criterio seleccionado
      const campo = filtros.ordenarPor || "fecha_inicio"
      let valorA: any = a[campo as keyof Expediente]
      let valorB: any = b[campo as keyof Expediente]

      // Manejar valores nulos
      if (valorA === null || valorA === undefined) valorA = ""
      if (valorB === null || valorB === undefined) valorB = ""

      // Ordenar
      const comparacion = typeof valorA === "string" ? valorA.localeCompare(valorB) : valorA - valorB

      return filtros.ordenAscendente ? comparacion : -comparacion
    })
}

export function useExpedientesOffline(filtros: FiltrosExpediente = {}) {
  const { state, service } = useOfflineService()
  const [expedientes, setExpedientes] = useState<Expediente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Cargar expedientes
  const cargarExpedientes = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Obtener expedientes del servicio offline
      const cachedExpedientes = service.getCachedData<Expediente>("expedientes")

      // Aplicar filtros
      const expedientesFiltrados = filtrarExpedientes(cachedExpedientes, filtros)

      setExpedientes(expedientesFiltrados)

      // Si está online y no hay datos en caché, intentar sincronizar
      if (state?.isOnline && cachedExpedientes.length === 0 && !state.syncInProgress) {
        await service.syncData()
      }
    } catch (err: any) {
      console.error("Error al cargar expedientes:", err)
      setError(err.message || "Error al cargar expedientes")

      toast({
        title: "Error",
        description: "No se pudieron cargar los expedientes.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [filtros, service, state?.isOnline, state?.syncInProgress, toast])

  // Crear un nuevo expediente
  const crearExpediente = async (data: Omit<Expediente, "id">) => {
    try {
      const result = await service.performOperation<Expediente>("expedientes", "insert", data)

      if (result.success) {
        if (result.offlineId) {
          toast({
            title: "Expediente guardado localmente",
            description: "El expediente se sincronizará cuando se restablezca la conexión.",
            variant: "warning",
          })
        } else {
          toast({
            title: "Expediente creado",
            description: "El expediente ha sido creado correctamente.",
          })
        }

        // Recargar expedientes para reflejar el cambio
        await cargarExpedientes()

        return { success: true, data: result.data, offlineId: result.offlineId }
      } else {
        throw new Error(result.error || "Error al crear expediente")
      }
    } catch (err: any) {
      console.error("Error al crear expediente:", err)
      toast({
        title: "Error",
        description: "No se pudo crear el expediente.",
        variant: "destructive",
      })
      return { success: false, error: err.message }
    }
  }

  // Actualizar un expediente existente
  const actualizarExpediente = async (id: string, data: Partial<Expediente>) => {
    try {
      const result = await service.performOperation<Expediente>("expedientes", "update", { id, ...data })

      if (result.success) {
        if (result.offlineId) {
          toast({
            title: "Cambios guardados localmente",
            description: "Los cambios se sincronizarán cuando se restablezca la conexión.",
            variant: "warning",
          })
        } else {
          toast({
            title: "Expediente actualizado",
            description: "El expediente ha sido actualizado correctamente.",
          })
        }

        // Recargar expedientes para reflejar el cambio
        await cargarExpedientes()

        return { success: true, data: result.data, offlineId: result.offlineId }
      } else {
        throw new Error(result.error || "Error al actualizar expediente")
      }
    } catch (err: any) {
      console.error("Error al actualizar expediente:", err)
      toast({
        title: "Error",
        description: "No se pudo actualizar el expediente.",
        variant: "destructive",
      })
      return { success: false, error: err.message }
    }
  }

  // Eliminar un expediente
  const eliminarExpediente = async (id: string) => {
    try {
      const result = await service.performOperation<void>("expedientes", "delete", { id })

      if (result.success) {
        if (result.offlineId) {
          toast({
            title: "Eliminación pendiente",
            description: "El expediente se eliminará cuando se restablezca la conexión.",
            variant: "warning",
          })
        } else {
          toast({
            title: "Expediente eliminado",
            description: "El expediente ha sido eliminado correctamente.",
          })
        }

        // Recargar expedientes para reflejar el cambio
        await cargarExpedientes()

        return { success: true, offlineId: result.offlineId }
      } else {
        throw new Error(result.error || "Error al eliminar expediente")
      }
    } catch (err: any) {
      console.error("Error al eliminar expediente:", err)
      toast({
        title: "Error",
        description: "No se pudo eliminar el expediente.",
        variant: "destructive",
      })
      return { success: false, error: err.message }
    }
  }

  // Forzar sincronización
  const sincronizar = async () => {
    setLoading(true)
    try {
      await service.forceSyncData()
      await cargarExpedientes()
      return true
    } catch (err) {
      console.error("Error al sincronizar:", err)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Cargar expedientes al montar el componente o cuando cambian los filtros
  useEffect(() => {
    cargarExpedientes()
  }, [cargarExpedientes])

  // Suscribirse a cambios en el estado del servicio offline
  useEffect(() => {
    if (state) {
      // Si hay cambios en los datos o en las operaciones pendientes, recargar
      cargarExpedientes()
    }
  }, [state, cargarExpedientes])

  return {
    expedientes,
    loading,
    error,
    isOnline: state?.isOnline || false,
    lastSyncTime: state?.lastSyncTime,
    syncInProgress: state?.syncInProgress || false,
    pendingOperations: state?.pendingOperations || [],
    crearExpediente,
    actualizarExpediente,
    eliminarExpediente,
    sincronizar,
  }
}
