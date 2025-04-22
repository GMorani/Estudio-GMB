import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// Implementación de patrón singleton para el cliente de Supabase en el lado del cliente
let supabaseInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClientComponentClient<Database>()
  }
  return supabaseInstance
}

// Exportar el cliente de Supabase como una exportación nombrada
export const supabase = getSupabaseClient()

// Exportar la función createClient como se requiere
export const createClient = createClientComponentClient
