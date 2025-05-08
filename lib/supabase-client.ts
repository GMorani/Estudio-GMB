"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import { useState, useEffect } from "react"

// Mapa para rastrear las solicitudes por ruta
const requestsMap = new Map<string, number>()
const MAX_REQUESTS_PER_ROUTE = 5 // Máximo número de solicitudes por ruta en un período de tiempo
const RATE_LIMIT_WINDOW = 5000 // Ventana de tiempo en ms (5 segundos)
const MAX_RETRY_ATTEMPTS = 3 // Número máximo de reintentos
const RETRY_DELAY = 1000 // Retraso entre reintentos en ms

// Función para verificar si una ruta ha excedido el límite de solicitudes
function isRateLimited(route: string): boolean {
  const now = Date.now()
  const routeRequests = requestsMap.get(route) || 0

  if (routeRequests >= MAX_REQUESTS_PER_ROUTE) {
    return true
  }

  // Incrementar el contador de solicitudes
  requestsMap.set(route, routeRequests + 1)

  // Restablecer el contador después de la ventana de tiempo
  setTimeout(() => {
    const currentRequests = requestsMap.get(route) || 0
    requestsMap.set(route, Math.max(0, currentRequests - 1))
  }, RATE_LIMIT_WINDOW)

  return false
}

// Función para retrasar la ejecución
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Cliente de Supabase con manejo de errores y limitación de tasa
export function useSupabaseClient() {
  const supabase = createClientComponentClient({
    options: {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      global: {
        fetch: (...args) => {
          // Usar un fetch personalizado con timeout
          const [resource, config] = args
          return fetch(resource, {
            ...config,
            headers: {
              ...config?.headers,
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
            // Asegurar que las credenciales se envíen correctamente
            credentials: "include",
          })
        },
      },
    },
  })
  const { toast } = useToast()
  const [isConnected, setIsConnected] = useState<boolean | null>(null)

  // Verificar la conexión al inicializar
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase
          .from("estados_expediente")
          .select("count", { count: "exact", head: true })
          .limit(1)
          .timeout(5000)

        setIsConnected(!error)
      } catch (error) {
        console.error("Error al verificar conexión:", error)
        setIsConnected(false)
      }
    }

    checkConnection()
  }, [supabase])

  // Función para realizar consultas con manejo de errores, limitación de tasa y reintentos
  async function query<T>(
    route: string,
    queryFn: () => Promise<{ data: T | null; error: any }>,
    retryCount = 0,
  ): Promise<{ data: T | null; error: any; isOffline?: boolean }> {
    // Si sabemos que no hay conexión, no intentar la consulta
    if (isConnected === false) {
      return {
        data: null,
        error: new Error("No hay conexión a la base de datos"),
        isOffline: true,
      }
    }

    // Verificar si la ruta ha excedido el límite de solicitudes
    if (isRateLimited(route)) {
      toast({
        title: "Demasiadas solicitudes",
        description: "Por favor, espera un momento antes de intentar nuevamente.",
        variant: "destructive",
      })

      return {
        data: null,
        error: new Error("Too many requests. Please try again later."),
      }
    }

    try {
      const result = await queryFn()

      if (result.error) {
        // Si es un error de conexión y no hemos excedido los reintentos, intentar nuevamente
        if (
          (result.error.message?.includes("Failed to fetch") ||
            result.error.message?.includes("NetworkError") ||
            result.error.message?.includes("network") ||
            result.error.message?.includes("timeout") ||
            result.error.code === "PGRST301") &&
          retryCount < MAX_RETRY_ATTEMPTS
        ) {
          // Esperar antes de reintentar
          await delay(RETRY_DELAY * (retryCount + 1))
          return query(route, queryFn, retryCount + 1)
        }

        // Manejar errores específicos
        if (result.error.message && result.error.message.includes("Too Many")) {
          toast({
            title: "Límite de solicitudes excedido",
            description: "El servidor está ocupado. Por favor, intenta nuevamente en unos momentos.",
            variant: "destructive",
          })
        } else if (result.error.message && result.error.message.includes("JWT")) {
          toast({
            title: "Sesión expirada",
            description: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
            variant: "destructive",
          })
          // Aquí podrías redirigir a la página de login o refrescar el token
        } else if (
          result.error.message &&
          (result.error.message.includes("Failed to fetch") ||
            result.error.message.includes("NetworkError") ||
            result.error.message.includes("network"))
        ) {
          toast({
            title: "Error de conexión",
            description: "No se pudo conectar con la base de datos. Verifica tu conexión a internet.",
            variant: "destructive",
          })
          setIsConnected(false)
          return {
            data: null,
            error: result.error,
            isOffline: true,
          }
        } else {
          toast({
            title: "Error",
            description: "Ocurrió un error al procesar la solicitud.",
            variant: "destructive",
          })
        }
      } else {
        // Si la consulta fue exitosa, actualizar el estado de conexión
        setIsConnected(true)
      }

      return result
    } catch (error: any) {
      console.error(`Error en la consulta ${route}:`, error)

      // Si es un error de red y no hemos excedido los reintentos, intentar nuevamente
      if (
        (error.message?.includes("Failed to fetch") ||
          error.message?.includes("NetworkError") ||
          error.message?.includes("network") ||
          error.message?.includes("timeout")) &&
        retryCount < MAX_RETRY_ATTEMPTS
      ) {
        // Esperar antes de reintentar
        await delay(RETRY_DELAY * (retryCount + 1))
        return query(route, queryFn, retryCount + 1)
      }

      // Actualizar estado de conexión si es un error de red
      if (
        error.message?.includes("Failed to fetch") ||
        error.message?.includes("NetworkError") ||
        error.message?.includes("network")
      ) {
        setIsConnected(false)
        toast({
          title: "Error de conexión",
          description: "No se pudo conectar con la base de datos. Verifica tu conexión a internet.",
          variant: "destructive",
        })
        return {
          data: null,
          error,
          isOffline: true,
        }
      } else {
        toast({
          title: "Error",
          description: "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
          variant: "destructive",
        })
      }

      return {
        data: null,
        error,
      }
    }
  }

  // Función para verificar la conexión manualmente
  async function checkConnection(): Promise<boolean> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    try {
      const { error } = await supabase
        .from("estados_expediente")
        .select("count", { count: "exact", head: true })
        .limit(1)
        .abortSignal(controller.signal)

      clearTimeout(timeoutId)
      const connected = !error
      setIsConnected(connected)
      return connected
    } catch (error) {
      clearTimeout(timeoutId)
      console.error("Error al verificar conexión:", error)
      setIsConnected(false)
      return false
    }
  }

  return {
    ...supabase,
    safeQuery: query,
    isConnected,
    checkConnection,
  }
}
