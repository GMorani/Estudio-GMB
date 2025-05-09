import { google } from "googleapis"
import { createServerSupabaseClient } from "@/lib/supabase"

// Configuración de credenciales de Google
const SCOPES = ["https://www.googleapis.com/auth/drive.file"]

// Función para obtener el cliente OAuth2
export async function getOAuth2Client(userId: string) {
  const supabase = createServerSupabaseClient()

  // Obtener tokens de Google Drive del usuario desde Supabase
  const { data, error } = await supabase.from("user_google_tokens").select("*").eq("user_id", userId).single()

  if (error || !data) {
    throw new Error("No se encontraron tokens de Google Drive para este usuario")
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  )

  // Configurar tokens
  oauth2Client.setCredentials({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expiry_date: data.expiry_date,
  })

  return oauth2Client
}

// Función para guardar un documento en Google Drive
export async function saveDocumentToDrive(
  userId: string,
  title: string,
  content: string,
  folderId?: string,
  fileId?: string,
) {
  try {
    const oauth2Client = await getOAuth2Client(userId)
    const drive = google.drive({ version: "v3", auth: oauth2Client })

    // Convertir el contenido HTML a un archivo
    const fileMetadata = {
      name: title,
      mimeType: "application/vnd.google-apps.document",
    }

    if (folderId) {
      fileMetadata.parents = [folderId]
    }

    let response

    if (fileId) {
      // Actualizar documento existente
      response = await drive.files.update({
        fileId,
        requestBody: fileMetadata,
        media: {
          mimeType: "text/html",
          body: content,
        },
      })
    } else {
      // Crear nuevo documento
      response = await drive.files.create({
        requestBody: fileMetadata,
        media: {
          mimeType: "text/html",
          body: content,
        },
        fields: "id,webViewLink",
      })
    }

    // Guardar referencia en Supabase
    const supabase = createServerSupabaseClient()

    if (fileId) {
      await supabase
        .from("documentos")
        .update({
          titulo: title,
          ultima_modificacion: new Date().toISOString(),
        })
        .eq("google_file_id", fileId)
    } else {
      await supabase.from("documentos").insert({
        user_id: userId,
        titulo: title,
        google_file_id: response.data.id,
        google_view_link: response.data.webViewLink,
        fecha_creacion: new Date().toISOString(),
        ultima_modificacion: new Date().toISOString(),
      })
    }

    return {
      fileId: response.data.id,
      webViewLink: response.data.webViewLink,
    }
  } catch (error) {
    console.error("Error al guardar documento en Google Drive:", error)
    throw error
  }
}

// Función para obtener un documento de Google Drive
export async function getDocumentFromDrive(userId: string, fileId: string) {
  try {
    const oauth2Client = await getOAuth2Client(userId)
    const drive = google.drive({ version: "v3", auth: oauth2Client })

    // Obtener metadatos del archivo
    const fileMetadata = await drive.files.get({
      fileId,
      fields: "name,webViewLink",
    })

    // Obtener contenido del archivo
    const response = await drive.files.export({
      fileId,
      mimeType: "text/html",
    })

    return {
      title: fileMetadata.data.name,
      content: response.data,
      webViewLink: fileMetadata.data.webViewLink,
    }
  } catch (error) {
    console.error("Error al obtener documento de Google Drive:", error)
    throw error
  }
}

// Función para listar documentos de Google Drive
export async function listDocumentsFromDrive(userId: string, folderId?: string) {
  try {
    const oauth2Client = await getOAuth2Client(userId)
    const drive = google.drive({ version: "v3", auth: oauth2Client })

    let query = "mimeType='application/vnd.google-apps.document'"
    if (folderId) {
      query += ` and '${folderId}' in parents`
    }

    const response = await drive.files.list({
      q: query,
      fields: "files(id, name, webViewLink, modifiedTime)",
      orderBy: "modifiedTime desc",
    })

    return response.data.files
  } catch (error) {
    console.error("Error al listar documentos de Google Drive:", error)
    throw error
  }
}
