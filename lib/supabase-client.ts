import { createClient as createClientBase } from "@supabase/supabase-js"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

// Cliente para componentes del servidor
export function createClient() {
  return createServerComponentClient<Database>({ cookies })
}

// Cliente para componentes del cliente
let clientSingleton: ReturnType<typeof createClientBase<Database>> | null = null

export function createClientClient() {
  if (clientSingleton) return clientSingleton

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  clientSingleton = createClientBase<Database>(supabaseUrl, supabaseKey)
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
