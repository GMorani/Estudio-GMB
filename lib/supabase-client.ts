"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"

// Mapa para rastrear las solicitudes por ruta
const requestsMap = new Map<string, number>()
const MAX_REQUESTS_PER_ROUTE = 5 // Máximo número de solicitudes por ruta en un período de tiempo
const RATE_LIMIT_WINDOW = 5000 // Ventana de tiempo en ms (5 segundos)

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

// Cliente de Supabase con manejo de errores y limitación de tasa
export function useSupabaseClient() {
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  // Función para realizar consultas con manejo de errores y limitación de tasa
  async function query<T>(
    route: string,
    queryFn: () => Promise<{ data: T | null; error: any }>,
  ): Promise<{ data: T | null; error: any }> {
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
        // Manejar errores específicos
        if (result.error.message && result.error.message.includes("Too Many")) {
          toast({
            title: "Límite de solicitudes excedido",
            description: "El servidor está ocupado. Por favor, intenta nuevamente en unos momentos.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error",
            description: "Ocurrió un error al procesar la solicitud.",
            variant: "destructive",
          })
        }
      }

      return result
    } catch (error: any) {
      console.error(`Error en la consulta ${route}:`, error)

      toast({
        title: "Error",
        description: "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
        variant: "destructive",
      })

      return {
        data: null,
        error,
      }
    }
  }

  return {
    ...supabase,
    safeQuery: query,
  }
}

// Exportar la función createClient como se requiere
export const createClient = createClientComponentClient
