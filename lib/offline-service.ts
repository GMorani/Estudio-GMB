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
  connectionStatus: "checking" | "connected" | "disconnected" | "error"
  lastError?: string
}

// Claves para localStorage
const STORAGE_KEYS = {
  OFFLINE_STATE: "gmb_offline_state",
  PENDING_OPERATIONS: "gmb_pending_operations",
}

// Estado inicial
const initialState: OfflineState = {
  isOnline: navigator.onLine,
  lastSyncTime: null,
  pendingOperations: [],
  data: {},
  syncInProgress: false,
  connectionStatus: "checking",
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

// Función para retrasar la ejecución
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Clase principal del servicio offline
export class OfflineService {
  private static instance: OfflineService
  private state: OfflineState
  private listeners: Set<(state: OfflineState) => void>
  private supabase
  private maxRetries = 3
  private syncLock = false
  private syncInterval: NodeJS.Timeout | null = null
  private connectionCheckInterval: NodeJS.Timeout | null = null
  private retryDelay = 1000 // ms
  private connectionCheckAttempts = 0
  private maxConnectionCheckAttempts = 3

  private constructor() {
    // Inicializar estado desde localStorage o usar el inicial
    const savedState = this.loadStateFromStorage()
    this.state = savedState || { ...initialState }
    this.listeners = new Set()

    // Inicializar con datos de ejemplo inmediatamente para asegurar que siempre haya datos
    if (Object.keys(this.state.data).length === 0) {
      this.state.data = { ...EXAMPLE_DATA }
      this.saveStateToStorage()
    }

    // Inicializar Supabase con manejo de errores
    try {
      this.supabase = createClientComponentClient()
    } catch (error) {
      console.error("Error al inicializar Supabase:", error)
      this.updateConnectionStatus("error", "Error al inicializar el cliente de Supabase")
    }

    // Configurar event listeners para detectar cambios en la conexión
    window.addEventListener("online", this.handleOnline)
    window.addEventListener("offline", this.handleOffline)

    // Verificar conexión después de un pequeño retraso
    setTimeout(() => {
      this.checkConnection().catch(() => {
        // Si falla la verificación, asegurarse de que estamos en modo offline
        this.updateConnectionStatus("error", "No se pudo conectar con Supabase")
      })
    }, 1000)

    // Configurar intervalo para verificar conexión periódicamente
    this.connectionCheckInterval = setInterval(() => {
      if (this.state.isOnline) {
        this.checkConnection().catch(() => {
          // Si falla la verificación, asegurarse de que estamos en modo offline
          this.updateConnectionStatus("error", "No se pudo conectar con Supabase")
        })
      }
    }, 60000) // Verificar cada minuto
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

  // Guardar estado en localStorage
  private saveStateToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_STATE, JSON.stringify(this.state))
    } catch (error) {
      console.error("Error al guardar estado offline:", error)
    }
  }

  // Verificar conexión a Supabase
  private async checkConnection() {
    if (!this.state.isOnline) {
      this.updateConnectionStatus("disconnected")
      return false
    }

    this.updateConnectionStatus("checking")

    // Si no se pudo inicializar Supabase, no intentar la conexión
    if (!this.supabase) {
      this.updateConnectionStatus("error", "Cliente de Supabase no inicializado")
      return false
    }

    try {
      // Usar AbortController para manejar timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      try {
        // Intentar una consulta simple que no requiera mucho procesamiento
        const { data, error } = await this.supabase
          .from("estados_expediente")
          .select("id")
          .limit(1)
          .abortSignal(controller.signal)

        clearTimeout(timeoutId)

        if (error) {
          console.error("Error al verificar conexión:", error)

          // Forzar modo offline si hay un error de conexión
          this.updateConnectionStatus("error", error.message)
          return false
        }

        // Resetear contador de intentos si la conexión es exitosa
        this.connectionCheckAttempts = 0
        this.updateConnectionStatus("connected")

        // Si es la primera conexión exitosa, iniciar sincronización
        if (this.state.lastSyncTime === null) {
          this.syncData()
        }

        return true
      } catch (error: any) {
        clearTimeout(timeoutId)
        console.error("Excepción al verificar conexión:", error)

        // Forzar modo offline para cualquier error
        this.updateConnectionStatus("error", error.message || "Error desconocido")
        return false
      }
    } catch (error: any) {
      console.error("Error inesperado al verificar conexión:", error)
      this.updateConnectionStatus("error", error.message || "Error desconocido")
      return false
    }
  }

  // Actualizar estado de conexión
  private updateConnectionStatus(status: OfflineState["connectionStatus"], error?: string) {
    this.state = {
      ...this.state,
      connectionStatus: status,
      lastError: error,
    }
    this.saveStateToStorage()
    this.notifyListeners()
  }

  // Manejadores de eventos de conexión
  private handleOnline = () => {
    this.state = {
      ...this.state,
      isOnline: true,
    }
    this.saveStateToStorage()
    this.notifyListeners()

    // Resetear contador de intentos cuando volvemos a estar online
    this.connectionCheckAttempts = 0

    // Verificar conexión a Supabase
    this.checkConnection().then((connected) => {
      if (connected) {
        toast({
          title: "Conexión restablecida",
          description: "Se ha restablecido la conexión a internet y a la base de datos.",
        })
        // Iniciar sincronización automática
        this.startSyncInterval()
      } else {
        toast({
          title: "Conexión limitada",
          description: "Hay conexión a internet pero no se puede acceder a la base de datos.",
          variant: "warning",
        })
      }
    })
  }

  private handleOffline = () => {
    this.state = {
      ...this.state,
      isOnline: false,
      connectionStatus: "disconnected",
    }
    this.saveStateToStorage()
    this.notifyListeners()
    this.stopSyncInterval()
    toast({
      title: "Sin conexión",
      description: "Trabajando en modo offline. Los cambios se sincronizarán cuando se restablezca la conexión.",
      variant: "destructive",
    })
  }

  // Iniciar intervalo de sincronización
  private startSyncInterval() {
    if (!this.syncInterval) {
      // Sincronizar cada 5 minutos
      this.syncInterval = setInterval(
        () => {
          this.syncData()
        },
        5 * 60 * 1000,
      )
    }
  }

  // Detener intervalo de sincronización
  private stopSyncInterval() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
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

  // Verificar si hay conexión a internet y a Supabase
  public isConnected(): boolean {
    return this.state.isOnline && this.state.connectionStatus === "connected"
  }

  // Sincronizar datos con Supabase
  public async syncData(): Promise<boolean> {
    // Evitar sincronizaciones simultáneas
    if (this.syncLock || this.state.syncInProgress) {
      console.log("Sincronización ya en progreso, saltando...")
      return false
    }

    if (!this.state.isOnline) {
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
      // Verificar conexión a Supabase
      const connected = await this.checkConnection()

      if (!connected) {
        throw new Error("No se pudo conectar con Supabase")
      }

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

      return true
    } catch (error) {
      console.error("Error al sincronizar datos:", error)

      this.state = {
        ...this.state,
        syncInProgress: false,
      }
      this.saveStateToStorage()
      this.notifyListeners()

      return false
    } finally {
      this.syncLock = false
    }
  }

  // Obtener y cachear datos de Supabase
  private async fetchAndCacheData() {
    if (this.state.connectionStatus !== "connected" || !this.supabase) {
      console.log("No hay conexión a Supabase, usando datos en caché")

      // Si no hay datos en caché, usar datos de ejemplo
      if (Object.keys(this.state.data).length === 0) {
        this.state.data = { ...EXAMPLE_DATA }
        this.saveStateToStorage()
        this.notifyListeners()
      }

      return
    }

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

      // Si hay un error, asegurarse de que haya datos de ejemplo disponibles
      if (Object.keys(this.state.data).length === 0) {
        this.state.data = { ...EXAMPLE_DATA }
        this.saveStateToStorage()
        this.notifyListeners()
      }

      this.updateConnectionStatus("error", error instanceof Error ? error.message : "Error desconocido")
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

    // Si está online y conectado a Supabase, intentar sincronizar inmediatamente
    if (this.isConnected()) {
      this.syncPendingOperations()
    }

    return id
  }

  // Sincronizar operaciones pendientes
  private async syncPendingOperations(): Promise<void> {
    if (!this.isConnected() || this.state.pendingOperations.length === 0 || !this.supabase) {
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

          // Esperar antes de reintentar la siguiente operación
          await delay(this.retryDelay * retryCount)
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
    // Si está online y conectado a Supabase, intentar realizar la operación directamente
    if (this.isConnected() && this.supabase) {
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

        // Actualizar caché local
        await this.fetchAndCacheData()

        return { success: true, data: result.data }
      } catch (error: any) {
        console.error(`Error al realizar operación ${type} en ${table}:`, error)

        // Si falla, agregar a operaciones pendientes
        const offlineId = this.addPendingOperation({ table, type, data })

        // Actualizar caché local manualmente para reflejar el cambio
        this.updateLocalCache(table, type, data)

        return {
          success: true, // Consideramos éxito porque se guardó localmente
          error: error.message || "Error al realizar la operación",
          offlineId,
        }
      }
    } else {
      // Si está offline o no conectado a Supabase, agregar a operaciones pendientes
      const offlineId = this.addPendingOperation({ table, type, data })

      // Actualizar caché local manualmente para reflejar el cambio
      this.updateLocalCache(table, type, data)

      return {
        success: true,
        offlineId,
        data: type === "delete" ? undefined : data,
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

  // Forzar sincronización manual
  public async forceSyncData(): Promise<boolean> {
    toast({
      title: "Sincronizando datos",
      description: "Intentando sincronizar datos con el servidor...",
    })

    // Verificar conexión a Supabase primero
    const connected = await this.checkConnection()

    if (!connected) {
      toast({
        title: "Error de sincronización",
        description: "No se pudo conectar con la base de datos. Trabajando en modo offline.",
        variant: "destructive",
      })
      return false
    }

    const result = await this.syncData()

    if (result) {
      toast({
        title: "Sincronización completada",
        description: "Los datos se han sincronizado correctamente.",
      })
    } else {
      toast({
        title: "Error de sincronización",
        description: "No se pudieron sincronizar los datos. Verifique su conexión a internet.",
        variant: "destructive",
      })
    }

    return result
  }

  // Reintentar operaciones con error
  public async retryFailedOperations(): Promise<boolean> {
    const failedOps = this.state.pendingOperations.filter((op) => op.status === "error")

    if (failedOps.length === 0) {
      toast({
        title: "No hay operaciones fallidas",
        description: "No hay operaciones fallidas para reintentar.",
      })
      return true
    }

    // Verificar conexión a Supabase primero
    const connected = await this.checkConnection()

    if (!connected) {
      toast({
        title: "Error de sincronización",
        description: "No se pudo conectar con la base de datos. Trabajando en modo offline.",
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
      connectionStatus: this.state.connectionStatus,
    }
    this.saveStateToStorage()
    this.notifyListeners()

    toast({
      title: "Datos eliminados",
      description: "Se han eliminado todos los datos almacenados localmente.",
    })
  }

  // Limpiar al destruir
  public destroy() {
    window.removeEventListener("online", this.handleOnline)
    window.removeEventListener("offline", this.handleOffline)

    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }

    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval)
    }
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
