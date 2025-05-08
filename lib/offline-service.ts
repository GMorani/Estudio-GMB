"use client"

import React from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "@/components/ui/use-toast"

// Tipos de datos principales
export type OfflineData = {
  expedientes?: any[]
  clientes?: any[]
  aseguradoras?: any[]
  juzgados?: any[]
  tareas?: any[]
  abogados?: any[]
  mediadores?: any[]
  peritos?: any[]
  actividades?: any[]
  estadisticas?: any[]
  estados?: any[]
}

// Tipo para operaciones pendientes
export type PendingOperation = {
  id: string
  timestamp: number
  table: string
  type: "insert" | "update" | "delete"
  data: any
  status: "pending" | "processing" | "error" | "completed"
  error?: string
  retryCount?: number
}

// Estado global del servicio offline
export type OfflineState = {
  isOnline: boolean
  lastSyncTime: number | null
  pendingOperations: PendingOperation[]
  data: OfflineData
  syncInProgress: boolean
  forcedOfflineMode: boolean
}

// Claves para localStorage
const STORAGE_KEYS = {
  OFFLINE_STATE: "gmb_offline_state",
  PENDING_OPERATIONS: "gmb_pending_operations",
  FORCED_OFFLINE_MODE: "gmb_forced_offline_mode",
}

// Estado inicial
const initialState: OfflineState = {
  isOnline: navigator.onLine,
  lastSyncTime: null,
  pendingOperations: [],
  data: {},
  syncInProgress: false,
  forcedOfflineMode: true, // Comenzar siempre en modo offline forzado
}

// Datos de ejemplo para usar cuando no hay conexión
const EXAMPLE_DATA: OfflineData = {
  clientes: [
    {
      id: "offline_1",
      nombre: "Juan Pérez",
      dni_cuit: "20123456789",
      telefono: "1122334455",
      email: "juan@example.com",
      domicilio: "Calle Falsa 123",
    },
    {
      id: "offline_2",
      nombre: "María López",
      dni_cuit: "27987654321",
      telefono: "5544332211",
      email: "maria@example.com",
      domicilio: "Avenida Siempreviva 742",
    },
    {
      id: "offline_3",
      nombre: "Carlos Rodríguez",
      dni_cuit: "20555666777",
      telefono: "1155667788",
      email: "carlos@example.com",
      domicilio: "Boulevard de los Sueños 456",
    },
  ],
  expedientes: [
    {
      id: "offline_1",
      numero: "123/2023",
      autos: "Pérez c/ Aseguradora",
      estado: "En trámite",
      fecha_inicio: "2023-01-15",
      cliente_nombre: "Juan Pérez",
      juzgado: "Juzgado Civil N°5",
      capital_reclamado: 150000,
    },
    {
      id: "offline_2",
      numero: "456/2023",
      autos: "López c/ Empresa",
      estado: "Sentencia",
      fecha_inicio: "2023-03-20",
      cliente_nombre: "María López",
      juzgado: "Juzgado Civil N°3",
      capital_reclamado: 200000,
    },
    {
      id: "offline_3",
      numero: "789/2023",
      autos: "Rodríguez c/ Compañía",
      estado: "Apelación",
      fecha_inicio: "2023-05-10",
      cliente_nombre: "Carlos Rodríguez",
      juzgado: "Juzgado Civil N°7",
      capital_reclamado: 180000,
    },
  ],
  aseguradoras: [
    {
      id: "offline_1",
      nombre: "Seguros ABC",
      dni_cuit: "30111222333",
      telefono: "0800123456",
      email: "contacto@seguros-abc.com",
      domicilio: "Av. Principal 789",
    },
    {
      id: "offline_2",
      nombre: "Aseguradora XYZ",
      dni_cuit: "30444555666",
      telefono: "0800654321",
      email: "info@aseguradora-xyz.com",
      domicilio: "Calle Secundaria 456",
    },
  ],
  juzgados: [
    {
      id: "offline_1",
      nombre: "Juzgado Civil N°3",
      dni_cuit: "30777888999",
      telefono: "0111234567",
      email: "juzgado3@justicia.gov.ar",
      domicilio: "Tribunales 123",
    },
    {
      id: "offline_2",
      nombre: "Juzgado Civil N°5",
      dni_cuit: "30888999000",
      telefono: "0111345678",
      email: "juzgado5@justicia.gov.ar",
      domicilio: "Tribunales 123",
    },
    {
      id: "offline_3",
      nombre: "Juzgado Civil N°7",
      dni_cuit: "30999000111",
      telefono: "0111456789",
      email: "juzgado7@justicia.gov.ar",
      domicilio: "Tribunales 123",
    },
  ],
  estados: [
    { id: "offline_1", nombre: "En trámite" },
    { id: "offline_2", nombre: "Sentencia" },
    { id: "offline_3", nombre: "Apelación" },
    { id: "offline_4", nombre: "Archivado" },
  ],
}

// Clase principal del servicio offline
export class OfflineService {
  private static instance: OfflineService
  private state: OfflineState
  private listeners: Set<(state: OfflineState) => void>
  private supabase = createClientComponentClient()
  private maxRetries = 3
  private syncLock = false

  private constructor() {
    // Inicializar estado desde localStorage o usar el inicial
    const savedState = this.loadStateFromStorage()

    // Verificar si el modo offline forzado está activado en localStorage
    const forcedOfflineMode = this.loadForcedOfflineMode()

    this.state = savedState || { ...initialState }

    // Asegurar que el modo offline forzado se respete
    this.state.forcedOfflineMode = forcedOfflineMode !== null ? forcedOfflineMode : initialState.forcedOfflineMode

    this.listeners = new Set()

    // Configurar event listeners para detectar cambios en la conexión
    window.addEventListener("online", this.handleOnline)
    window.addEventListener("offline", this.handleOffline)

    // Inicializar con datos de ejemplo si no hay datos
    if (Object.keys(this.state.data).length === 0) {
      this.state.data = { ...EXAMPLE_DATA }
      this.saveStateToStorage()
    }
  }

  // Patrón Singleton para asegurar una única instancia
  public static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService()
    }
    return OfflineService.instance
  }

  // Cargar estado desde localStorage
  private loadStateFromStorage(): OfflineState | null {
    try {
      const savedState = localStorage.getItem(STORAGE_KEYS.OFFLINE_STATE)
      if (savedState) {
        return JSON.parse(savedState)
      }
    } catch (error) {
      console.error("Error al cargar estado offline:", error)
    }
    return null
  }

  // Cargar configuración de modo offline forzado
  private loadForcedOfflineMode(): boolean | null {
    try {
      const forcedMode = localStorage.getItem(STORAGE_KEYS.FORCED_OFFLINE_MODE)
      if (forcedMode !== null) {
        return JSON.parse(forcedMode)
      }
    } catch (error) {
      console.error("Error al cargar modo offline forzado:", error)
    }
    return null
  }

  // Guardar estado en localStorage
  private saveStateToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_STATE, JSON.stringify(this.state))
      // Guardar también el modo offline forzado por separado
      localStorage.setItem(STORAGE_KEYS.FORCED_OFFLINE_MODE, JSON.stringify(this.state.forcedOfflineMode))
    } catch (error) {
      console.error("Error al guardar estado offline:", error)
    }
  }

  // Manejadores de eventos de conexión
  private handleOnline = () => {
    this.state = {
      ...this.state,
      isOnline: true,
    }
    this.saveStateToStorage()
    this.notifyListeners()

    // Solo mostrar notificación si no estamos en modo offline forzado
    if (!this.state.forcedOfflineMode) {
      toast({
        title: "Conexión restablecida",
        description: "Se ha restablecido la conexión a internet.",
      })
    }
  }

  private handleOffline = () => {
    this.state = {
      ...this.state,
      isOnline: false,
    }
    this.saveStateToStorage()
    this.notifyListeners()

    toast({
      title: "Sin conexión",
      description: "Trabajando en modo offline. Los cambios se guardarán localmente.",
      variant: "destructive",
    })
  }

  // Notificar a todos los listeners de cambios en el estado
  private notifyListeners() {
    this.listeners.forEach((listener) => {
      listener(this.state)
    })
  }

  // Suscribirse a cambios en el estado
  public subscribe(listener: (state: OfflineState) => void): () => void {
    this.listeners.add(listener)
    // Llamar inmediatamente con el estado actual
    listener(this.state)
    // Devolver función para cancelar suscripción
    return () => {
      this.listeners.delete(listener)
    }
  }

  // Obtener el estado actual
  public getState(): OfflineState {
    return this.state
  }

  // Verificar si hay conexión a internet
  public isOnline(): boolean {
    return this.state.isOnline && !this.state.forcedOfflineMode
  }

  // Activar o desactivar el modo offline forzado
  public setForcedOfflineMode(forced: boolean): void {
    this.state = {
      ...this.state,
      forcedOfflineMode: forced,
    }
    this.saveStateToStorage()
    this.notifyListeners()

    if (forced) {
      toast({
        title: "Modo offline activado",
        description: "La aplicación funcionará sin intentar conectarse a la base de datos.",
      })
    } else {
      toast({
        title: "Modo offline desactivado",
        description: "La aplicación intentará conectarse a la base de datos cuando sea necesario.",
      })
    }
  }

  // Sincronizar datos con Supabase (solo cuando se solicita explícitamente)
  public async syncData(): Promise<boolean> {
    // Si estamos en modo offline forzado, no permitir sincronización
    if (this.state.forcedOfflineMode) {
      toast({
        title: "Sincronización no disponible",
        description: "La sincronización no está disponible en modo offline forzado.",
        variant: "destructive",
      })
      return false
    }

    // Evitar sincronizaciones simultáneas
    if (this.syncLock || this.state.syncInProgress) {
      console.log("Sincronización ya en progreso, saltando...")
      return false
    }

    if (!this.state.isOnline) {
      toast({
        title: "Sin conexión",
        description: "No se puede sincronizar sin conexión a internet.",
        variant: "destructive",
      })
      return false
    }

    this.syncLock = true
    this.state = {
      ...this.state,
      syncInProgress: true,
    }
    this.saveStateToStorage()
    this.notifyListeners()

    try {
      toast({
        title: "Sincronizando",
        description: "Intentando sincronizar con la base de datos...",
      })

      // Intentar una operación simple para verificar la conexión
      const { count } = await this.supabase
        .from("estados_expediente")
        .select("*", { count: "exact", head: true })
        .limit(1)
        .throwOnError()

      // Sincronizar operaciones pendientes primero
      await this.syncPendingOperations()

      // Obtener datos actualizados de Supabase
      await this.fetchAndCacheData()

      // Actualizar tiempo de última sincronización
      this.state = {
        ...this.state,
        lastSyncTime: Date.now(),
        syncInProgress: false,
      }
      this.saveStateToStorage()
      this.notifyListeners()

      toast({
        title: "Sincronización completada",
        description: "Los datos se han sincronizado correctamente.",
      })

      return true
    } catch (error) {
      console.error("Error al sincronizar datos:", error)

      this.state = {
        ...this.state,
        syncInProgress: false,
      }
      this.saveStateToStorage()
      this.notifyListeners()

      toast({
        title: "Error de sincronización",
        description: "No se pudo conectar con la base de datos. Trabajando en modo offline.",
        variant: "destructive",
      })

      return false
    } finally {
      this.syncLock = false
    }
  }

  // Obtener y cachear datos de Supabase
  private async fetchAndCacheData() {
    try {
      // Obtener expedientes (limitado a 100 para evitar problemas de rendimiento)
      const { data: expedientes, error: expedientesError } = await this.supabase
        .from("expedientes")
        .select(`
          id, numero, autos, fecha_inicio, fecha_alta,
          estados_expediente (id, nombre),
          juzgados (id, nombre),
          personas (id, nombre),
          aseguradoras (id, nombre),
          capital_reclamado, notas
        `)
        .order("fecha_inicio", { ascending: false })
        .limit(100)

      if (expedientesError) throw expedientesError

      // Transformar los datos de expedientes
      const expedientesFormateados =
        expedientes?.map((exp) => ({
          id: exp.id,
          numero: exp.numero || "",
          autos: exp.autos || "",
          estado: exp.estados_expediente?.nombre || "Sin estado",
          fecha_inicio: exp.fecha_inicio || "",
          fecha_alta: exp.fecha_alta || "",
          juzgado: exp.juzgados?.nombre || "Sin juzgado",
          cliente_id: exp.personas?.id,
          cliente_nombre: exp.personas?.nombre,
          estado_id: exp.estados_expediente?.id,
          juzgado_id: exp.juzgados?.id,
          aseguradora_id: exp.aseguradoras?.id,
          aseguradora_nombre: exp.aseguradoras?.nombre,
          capital_reclamado: exp.capital_reclamado,
          notas: exp.notas,
        })) || []

      // Obtener clientes
      const { data: clientes, error: clientesError } = await this.supabase
        .from("personas")
        .select("*, clientes(*)")
        .eq("tipo_id", 1)
        .order("nombre")
        .limit(100)

      if (clientesError) throw clientesError

      // Obtener aseguradoras
      const { data: aseguradoras, error: aseguradorasError } = await this.supabase
        .from("personas")
        .select("*")
        .eq("tipo_id", 3)
        .order("nombre")
        .limit(100)

      if (aseguradorasError) throw aseguradorasError

      // Obtener juzgados
      const { data: juzgados, error: juzgadosError } = await this.supabase
        .from("personas")
        .select("*, juzgados(*)")
        .eq("tipo_id", 4)
        .order("nombre")
        .limit(100)

      if (juzgadosError) throw juzgadosError

      // Obtener tareas pendientes
      const { data: tareas, error: tareasError } = await this.supabase
        .from("tareas_expediente")
        .select("*, expedientes(*)")
        .eq("cumplida", false)
        .order("fecha_vencimiento")
        .limit(100)

      if (tareasError) throw tareasError

      // Obtener estados de expediente
      const { data: estados, error: estadosError } = await this.supabase
        .from("estados_expediente")
        .select("*")
        .order("nombre")

      if (estadosError) throw estadosError

      // Actualizar el estado con los datos obtenidos
      this.state = {
        ...this.state,
        data: {
          ...this.state.data,
          expedientes: expedientesFormateados || [],
          clientes: clientes || [],
          aseguradoras: aseguradoras || [],
          juzgados: juzgados || [],
          tareas: tareas || [],
          estados: estados || [],
        },
      }

      this.saveStateToStorage()
      this.notifyListeners()
    } catch (error) {
      console.error("Error al obtener datos de Supabase:", error)
      throw error
    }
  }

  // Agregar una operación pendiente
  public addPendingOperation(operation: Omit<PendingOperation, "id" | "timestamp" | "status" | "retryCount">): string {
    const id = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newOperation: PendingOperation = {
      id,
      timestamp: Date.now(),
      status: "pending",
      retryCount: 0,
      ...operation,
    }

    this.state = {
      ...this.state,
      pendingOperations: [...this.state.pendingOperations, newOperation],
    }
    this.saveStateToStorage()
    this.notifyListeners()

    return id
  }

  // Sincronizar operaciones pendientes
  private async syncPendingOperations(): Promise<void> {
    if (this.state.forcedOfflineMode || !this.state.isOnline || this.state.pendingOperations.length === 0) {
      return
    }

    // Obtener operaciones pendientes
    const pendingOps = this.state.pendingOperations.filter((op) => op.status === "pending")

    for (const operation of pendingOps) {
      // Marcar como procesando
      this.updateOperationStatus(operation.id, "processing")

      try {
        // Verificar si la operación ha excedido el número máximo de reintentos
        if ((operation.retryCount || 0) >= this.maxRetries) {
          throw new Error(`Operación excedió el número máximo de reintentos (${this.maxRetries})`)
        }

        // Ejecutar la operación en Supabase
        let result
        switch (operation.type) {
          case "insert":
            result = await this.supabase.from(operation.table).insert(operation.data).select().single()
            break
          case "update":
            result = await this.supabase
              .from(operation.table)
              .update(operation.data)
              .eq("id", operation.data.id)
              .select()
              .single()
            break
          case "delete":
            result = await this.supabase.from(operation.table).delete().eq("id", operation.data.id)
            break
        }

        if (result.error) {
          throw result.error
        }

        // Marcar como completada
        this.updateOperationStatus(operation.id, "completed")
      } catch (error: any) {
        console.error(`Error al sincronizar operación ${operation.id}:`, error)

        // Incrementar contador de reintentos
        const retryCount = (operation.retryCount || 0) + 1

        // Marcar como error si excedió los reintentos, o volver a pending para reintentar
        if (retryCount >= this.maxRetries) {
          this.updateOperationStatus(operation.id, "error", error.message || "Error desconocido", retryCount)
        } else {
          this.updateOperationStatus(operation.id, "pending", error.message || "Error desconocido", retryCount)
        }
      }
    }

    // Limpiar operaciones completadas más antiguas de 24 horas
    this.cleanupCompletedOperations()
  }

  // Actualizar el estado de una operación
  private updateOperationStatus(
    operationId: string,
    status: PendingOperation["status"],
    error?: string,
    retryCount?: number,
  ): void {
    this.state = {
      ...this.state,
      pendingOperations: this.state.pendingOperations.map((op) =>
        op.id === operationId
          ? { ...op, status, error, retryCount: retryCount !== undefined ? retryCount : op.retryCount }
          : op,
      ),
    }
    this.saveStateToStorage()
    this.notifyListeners()
  }

  // Limpiar operaciones completadas antiguas
  private cleanupCompletedOperations(): void {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    this.state = {
      ...this.state,
      pendingOperations: this.state.pendingOperations.filter(
        (op) => op.status !== "completed" || op.timestamp > oneDayAgo,
      ),
    }
    this.saveStateToStorage()
    this.notifyListeners()
  }

  // Obtener datos cacheados
  public getCachedData<T>(table: keyof OfflineData): T[] {
    return (this.state.data[table] || []) as T[]
  }

  // Guardar datos en caché
  public cacheData(table: keyof OfflineData, data: any[]): void {
    this.state = {
      ...this.state,
      data: {
        ...this.state.data,
        [table]: data,
      },
    }
    this.saveStateToStorage()
    this.notifyListeners()
  }

  // Realizar operación CRUD con soporte offline
  public async performOperation<T>(
    table: string,
    type: PendingOperation["type"],
    data: any,
  ): Promise<{ success: boolean; data?: T; error?: string; offlineId?: string }> {
    // Si estamos en modo offline forzado o sin conexión, siempre guardar localmente
    if (this.state.forcedOfflineMode || !this.state.isOnline) {
      const offlineId = this.addPendingOperation({ table, type, data })
      this.updateLocalCache(table, type, data)

      return {
        success: true,
        offlineId,
        data: type === "delete" ? undefined : data,
      }
    }

    // Si estamos online y no en modo forzado, intentar realizar la operación directamente
    try {
      let result
      switch (type) {
        case "insert":
          result = await this.supabase.from(table).insert(data).select().single()
          break
        case "update":
          result = await this.supabase.from(table).update(data).eq("id", data.id).select().single()
          break
        case "delete":
          result = await this.supabase.from(table).delete().eq("id", data.id)
          break
      }

      if (result.error) {
        throw result.error
      }

      return { success: true, data: result.data }
    } catch (error: any) {
      console.error(`Error al realizar operación ${type} en ${table}:`, error)

      // Si falla, agregar a operaciones pendientes
      const offlineId = this.addPendingOperation({ table, type, data })
      this.updateLocalCache(table, type, data)

      return {
        success: true, // Consideramos éxito porque se guardó localmente
        error: error.message || "Error al realizar la operación",
        offlineId,
      }
    }
  }

  // Actualizar caché local manualmente
  private updateLocalCache(table: string, type: PendingOperation["type"], data: any): void {
    const cacheKey = table as keyof OfflineData
    const currentData = [...(this.state.data[cacheKey] || [])]

    switch (type) {
      case "insert":
        // Agregar ID temporal si no tiene
        if (!data.id) {
          data.id = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
        // Marcar como modificado offline
        data._modified = true
        data._pendingSync = true
        currentData.push(data)
        break
      case "update":
        const updateIndex = currentData.findIndex((item) => item.id === data.id)
        if (updateIndex !== -1) {
          currentData[updateIndex] = {
            ...currentData[updateIndex],
            ...data,
            _modified: true,
            _pendingSync: true,
          }
        }
        break
      case "delete":
        const deleteIndex = currentData.findIndex((item) => item.id === data.id)
        if (deleteIndex !== -1) {
          currentData.splice(deleteIndex, 1)
        }
        break
    }

    this.cacheData(cacheKey, currentData)
  }

  // Reintentar operaciones con error
  public async retryFailedOperations(): Promise<boolean> {
    if (this.state.forcedOfflineMode) {
      toast({
        title: "Operación no disponible",
        description: "No se pueden reintentar operaciones en modo offline forzado.",
        variant: "destructive",
      })
      return false
    }

    const failedOps = this.state.pendingOperations.filter((op) => op.status === "error")

    if (failedOps.length === 0) {
      toast({
        title: "No hay operaciones fallidas",
        description: "No hay operaciones fallidas para reintentar.",
      })
      return true
    }

    if (!this.state.isOnline) {
      toast({
        title: "Sin conexión",
        description: "No se pueden reintentar operaciones sin conexión a internet.",
        variant: "destructive",
      })
      return false
    }

    // Marcar todas las operaciones fallidas como pendientes nuevamente
    this.state = {
      ...this.state,
      pendingOperations: this.state.pendingOperations.map((op) =>
        op.status === "error" ? { ...op, status: "pending", retryCount: 0 } : op,
      ),
    }
    this.saveStateToStorage()
    this.notifyListeners()

    toast({
      title: "Reintentando operaciones",
      description: `Reintentando ${failedOps.length} operaciones fallidas...`,
    })

    // Iniciar sincronización
    return this.syncData()
  }

  // Limpiar todos los datos almacenados
  public clearAllData(): void {
    this.state = {
      ...initialState,
      isOnline: navigator.onLine,
      data: { ...EXAMPLE_DATA }, // Mantener datos de ejemplo
      forcedOfflineMode: this.state.forcedOfflineMode, // Mantener configuración de modo offline
    }
    this.saveStateToStorage()
    this.notifyListeners()

    toast({
      title: "Datos eliminados",
      description: "Se han eliminado todos los datos almacenados localmente.",
    })
  }
}

// Hook para usar el servicio offline en componentes React
export function useOfflineService() {
  const [state, setState] = React.useState<OfflineState | null>(null)

  React.useEffect(() => {
    const service = OfflineService.getInstance()
    const unsubscribe = service.subscribe(setState)

    return () => {
      unsubscribe()
    }
  }, [])

  return {
    state,
    service: OfflineService.getInstance(),
  }
}
