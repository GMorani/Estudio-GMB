import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Crear cliente de Supabase para componentes del servidor
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createSupabaseClient(supabaseUrl, supabaseKey)
}

// Crear cliente de Supabase para componentes del cliente
let clientSingleton: ReturnType<typeof createSupabaseClient> | null = null

export function createClientClient() {
  if (clientSingleton) return clientSingleton

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  clientSingleton = createSupabaseClient(supabaseUrl, supabaseKey)
  return clientSingleton
}
