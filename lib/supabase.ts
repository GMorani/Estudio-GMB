import { createClient } from "@supabase/supabase-js"

// Crear un cliente de Supabase para el lado del cliente con manejo de errores mejorado
export const createClientSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Error: Variables de entorno de Supabase no configuradas correctamente")
    // Proporcionar valores por defecto para evitar errores de inicialización
    return createClient("https://placeholder-url.supabase.co", "placeholder-key", {
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
    })
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
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
  })
}

// Crear un cliente de Supabase para el lado del servidor con manejo de errores mejorado
export const createServerSupabase = () => {
  const supabaseUrl = process.env.SUPABASE_URL as string
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Error: Variables de entorno de Supabase no configuradas correctamente")
    // Proporcionar valores por defecto para evitar errores de inicialización
    return createClient("https://placeholder-url.supabase.co", "placeholder-key", {
      auth: {
        persistSession: false,
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
          })
        },
      },
    })
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
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
        })
      },
    },
  })
}

// Función para verificar la conexión a Supabase
export const checkSupabaseConnection = async () => {
  try {
    const supabase = createClientSupabase()

    // Intentar una consulta simple para verificar la conexión
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    try {
      const { data, error } = await supabase
        .from("estados_expediente")
        .select("count", { count: "exact", head: true })
        .limit(1)
        .abortSignal(controller.signal)

      clearTimeout(timeoutId)

      if (error) {
        console.error("Error al verificar conexión con Supabase:", error)
        return { connected: false, error: error.message }
      }

      return { connected: true, data }
    } catch (error: any) {
      clearTimeout(timeoutId)

      // Si es un error de timeout
      if (error.name === "AbortError") {
        console.error("Timeout al verificar conexión con Supabase")
        return { connected: false, error: "Timeout al conectar con la base de datos" }
      }

      console.error("Excepción al verificar conexión con Supabase:", error)
      return { connected: false, error: error.message || "Error desconocido" }
    }
  } catch (error: any) {
    console.error("Excepción al verificar conexión con Supabase:", error)
    return { connected: false, error: error.message || "Error desconocido" }
  }
}
