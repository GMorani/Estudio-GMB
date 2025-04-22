import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// Exportar createClient como alias de createClientComponentClient para compatibilidad
export const createClient = createClientComponentClient

// Función para crear un cliente de Supabase con manejo de errores y limitación de tasa
export function createSupabaseClient() {
  const supabase = createClientComponentClient<Database>()

  // Contador de solicitudes para limitación de tasa
  let requestCount = 0
  const maxRequestsPerMinute = 100
  let lastResetTime = Date.now()

  // Función para verificar la limitación de tasa
  const checkRateLimit = () => {
    const now = Date.now()
    if (now - lastResetTime > 60000) {
      // Reiniciar contador cada minuto
      requestCount = 0
      lastResetTime = now
    }

    if (requestCount >= maxRequestsPerMinute) {
      throw new Error("Rate limit exceeded. Please try again later.")
    }

    requestCount++
  }

  // Envoltorio para métodos de Supabase con manejo de errores
  return {
    from: (table: string) => {
      checkRateLimit()

      const query = supabase.from(table)

      // Envolver métodos con manejo de errores
      const originalSelect = query.select.bind(query)
      query.select = (...args: any[]) => {
        try {
          return originalSelect(...args)
        } catch (error) {
          console.error(`Error in select operation on ${table}:`, error)
          throw error
        }
      }

      const originalInsert = query.insert.bind(query)
      query.insert = (...args: any[]) => {
        try {
          return originalInsert(...args)
        } catch (error) {
          console.error(`Error in insert operation on ${table}:`, error)
          throw error
        }
      }

      const originalUpdate = query.update.bind(query)
      query.update = (...args: any[]) => {
        try {
          return originalUpdate(...args)
        } catch (error) {
          console.error(`Error in update operation on ${table}:`, error)
          throw error
        }
      }

      const originalDelete = query.delete.bind(query)
      query.delete = (...args: any[]) => {
        try {
          return originalDelete(...args)
        } catch (error) {
          console.error(`Error in delete operation on ${table}:`, error)
          throw error
        }
      }

      return query
    },
    // Exponer otros métodos de supabase según sea necesario
    auth: supabase.auth,
    storage: supabase.storage,
    rpc: supabase.rpc,
  }
}
