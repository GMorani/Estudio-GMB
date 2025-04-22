import { createClient as createClientBase } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Verificar que las variables de entorno estén definidas
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL no está definido")
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("SUPABASE_SERVICE_ROLE_KEY no está definido")
}

// Cliente para componentes del servidor
export function createClient() {
  return createClientBase<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

// Cliente para componentes del cliente
let clientSingleton: ReturnType<typeof createClientBase<Database>>

export function createClientClient() {
  if (clientSingleton) return clientSingleton

  clientSingleton = createClientBase<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  return clientSingleton
}

// Función para crear un cliente de Supabase con manejo de errores y limitación de tasa
export function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  const supabase = createClientBase<Database>(supabaseUrl, supabaseKey)

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
