import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// Exportar createClient como alias de createClientComponentClient para compatibilidad
export const createClient = createClientComponentClient

// Implementación del patrón singleton para el cliente de Supabase
let supabaseInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null

export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClientComponentClient<Database>()
  }
  return supabaseInstance
}

// Cliente para uso en el servidor
export const createServerSupabaseClient = async () => {
  const { createServerComponentClient } = await import("@supabase/auth-helpers-nextjs")
  const { cookies } = await import("next/headers")

  return createServerComponentClient<Database>({ cookies })
}
