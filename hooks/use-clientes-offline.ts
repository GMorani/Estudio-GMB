"use client"

import { useState, useEffect } from "react"
import { useOfflineService } from "@/lib/offline-service"
import { useToast } from "@/components/ui/use-toast"

// Tipo para los clientes
export type Cliente = {
  id: string
  nombre: string
  dni_cuit: string
  telefono: string
  email: string
  domicilio: string
  referido?: string | null
}

export function useClientesOffline(filtro = "") {
  const { state, service } = useOfflineService()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Cargar clientes
  useEffect(() => {
    async function loadClientes() {
      setLoading(true)
      setError(null)

      try {
        // Obtener clientes del caché
        const cachedClientes = service.getCachedData<Cliente>("clientes")

        // Aplicar filtro de búsqueda
        let filteredClientes = [...cachedClientes]
        if (filtro) {
          filteredClientes = filteredClientes.filter(
            (cliente) =>
              cliente.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
              cliente.dni_cuit.toLowerCase().includes(filtro.toLowerCase()) ||
              cliente.email.toLowerCase().includes(filtro.toLowerCase()),
          )
        }

        // Ordenar por nombre
        filteredClientes.sort((a, b) => a.nombre.localeCompare(b.nombre))

        setClientes(filteredClientes)

        // Si está online, intentar sincronizar
        if (state?.isOnline && cachedClientes.length === 0) {
          await service.syncData()
        }
      } catch (err: any) {
        console.error("Error al cargar clientes:", err)
        setError(err.message || "Error al cargar clientes")

        toast({
          title: "Error",
          description: "No se pudieron cargar los clientes.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadClientes()
  }, [filtro, service, state?.isOnline, toast])

  // Crear un nuevo cliente
  const crearCliente = async (data: Omit<Cliente, "id">) => {
    try {
      const result = await service.performOperation<Cliente>("personas", "insert", {
        ...data,
        tipo_id: 1, // Tipo cliente
      })

      if (result.success) {
        // También crear en la tabla clientes
        if (result.data?.id) {
          await service.performOperation("clientes", "insert", {
            id: result.data.id,
            referido: data.referido,
          })
        }

        toast({
          title: "Cliente creado",
          description: "El cliente ha sido creado correctamente.",
        })
        return { success: true, data: result.data }
      } else {
        toast({
          title: "Advertencia",
          description: "El cliente se creará cuando se restablezca la conexión.",
          variant: "warning",
        })
        return { success: true, offlineId: result.offlineId }
      }
    } catch (err: any) {
      console.error("Error al crear cliente:", err)
      toast({
        title: "Error",
        description: "No se pudo crear el cliente.",
        variant: "destructive",
      })
      return { success: false, error: err.message }
    }
  }

  // Actualizar un cliente existente
  const actualizarCliente = async (id: string, data: Partial<Cliente>) => {
    try {
      // Separar datos para la tabla personas y clientes
      const { referido, ...personaData } = data

      // Actualizar en la tabla personas
      const result = await service.performOperation<Cliente>("personas", "update", {
        id,
        ...personaData,
      })

      // Si hay referido, actualizar en la tabla clientes
      if (referido !== undefined) {
        await service.performOperation("clientes", "update", {
          id,
          referido,
        })
      }

      if (result.success) {
        toast({
          title: "Cliente actualizado",
          description: "El cliente ha sido actualizado correctamente.",
        })
        return { success: true, data: result.data }
      } else {
        toast({
          title: "Advertencia",
          description: "El cliente se actualizará cuando se restablezca la conexión.",
          variant: "warning",
        })
        return { success: true, offlineId: result.offlineId }
      }
    } catch (err: any) {
      console.error("Error al actualizar cliente:", err)
      toast({
        title: "Error",
        description: "No se pudo actualizar el cliente.",
        variant: "destructive",
      })
      return { success: false, error: err.message }
    }
  }

  // Eliminar un cliente
  const eliminarCliente = async (id: string) => {
    try {
      // Primero eliminar de la tabla clientes
      await service.performOperation("clientes", "delete", { id })

      // Luego eliminar de la tabla personas
      const result = await service.performOperation<void>("personas", "delete", { id })

      if (result.success) {
        toast({
          title: "Cliente eliminado",
          description: "El cliente ha sido eliminado correctamente.",
        })
        return { success: true }
      } else {
        toast({
          title: "Advertencia",
          description: "El cliente se eliminará cuando se restablezca la conexión.",
          variant: "warning",
        })
        return { success: true, offlineId: result.offlineId }
      }
    } catch (err: any) {
      console.error("Error al eliminar cliente:", err)
      toast({
        title: "Error",
        description: "No se pudo eliminar el cliente.",
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
      return true
    } catch (err) {
      console.error("Error al sincronizar:", err)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    clientes,
    loading,
    error,
    isOnline: state?.isOnline || false,
    lastSyncTime: state?.lastSyncTime,
    crearCliente,
    actualizarCliente,
    eliminarCliente,
    sincronizar,
  }
}
