"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { getOAuth2Client } from "@/lib/google-drive"
import { google } from "googleapis"

export async function verificarConexionGoogleDrive() {
  const supabase = createServerSupabaseClient()

  // Obtener el usuario actual
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return { conectado: false, mensaje: "No hay sesión activa" }
  }

  const userId = session.user.id

  try {
    // Verificar si existen tokens para el usuario
    const { data: tokens, error } = await supabase.from("user_google_tokens").select("*").eq("user_id", userId).single()

    if (error || !tokens) {
      return { conectado: false, mensaje: "No hay tokens guardados" }
    }

    // Verificar si los tokens son válidos
    try {
      const oauth2Client = await getOAuth2Client(userId)
      const drive = google.drive({ version: "v3", auth: oauth2Client })

      // Intentar una operación simple para verificar que los tokens funcionan
      await drive.files.list({ pageSize: 1 })

      return { conectado: true, mensaje: "Conexión verificada correctamente" }
    } catch (error) {
      console.error("Error al verificar tokens:", error)
      return { conectado: false, mensaje: "Tokens inválidos o expirados" }
    }
  } catch (error) {
    console.error("Error al verificar conexión:", error)
    return { conectado: false, mensaje: "Error al verificar conexión" }
  }
}
