"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { saveDocumentToDrive, getDocumentFromDrive } from "@/lib/google-drive"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

interface GuardarDocumentoParams {
  documentoId?: string
  titulo: string
  contenido: string
  expedienteId?: string
}

export async function guardarDocumento({ documentoId, titulo, contenido, expedienteId }: GuardarDocumentoParams) {
  const supabase = createServerSupabaseClient()

  // Obtener el usuario actual
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    throw new Error("No hay sesión activa")
  }

  const userId = session.user.id

  try {
    let googleFileId = null

    // Si es un documento existente, obtener el ID de Google Drive
    if (documentoId) {
      const { data: documento } = await supabase
        .from("documentos")
        .select("google_file_id")
        .eq("id", documentoId)
        .single()

      if (documento) {
        googleFileId = documento.google_file_id
      }
    }

    // Guardar en Google Drive
    const resultado = await saveDocumentToDrive(
      userId,
      titulo,
      contenido,
      undefined, // folderId (opcional)
      googleFileId,
    )

    // Si es un documento nuevo, crear registro en Supabase
    if (!documentoId) {
      const { data: nuevoDocumento } = await supabase
        .from("documentos")
        .insert({
          user_id: userId,
          titulo,
          google_file_id: resultado.fileId,
          google_view_link: resultado.webViewLink,
          expediente_id: expedienteId,
        })
        .select("id")
        .single()

      documentoId = nuevoDocumento?.id
    }

    // Revalidar la página para actualizar la lista de documentos
    revalidatePath("/documentos")
    if (expedienteId) {
      revalidatePath(`/expedientes/${expedienteId}`)
    }

    return {
      success: true,
      documentoId,
      googleFileId: resultado.fileId,
      webViewLink: resultado.webViewLink,
    }
  } catch (error) {
    console.error("Error al guardar documento:", error)
    throw error
  }
}

export async function obtenerDocumento(documentoId: string) {
  const supabase = createServerSupabaseClient()

  // Obtener el usuario actual
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/login")
  }

  const userId = session.user.id

  try {
    // Obtener información del documento desde Supabase
    const { data: documento, error } = await supabase.from("documentos").select("*").eq("id", documentoId).single()

    if (error || !documento) {
      throw new Error("Documento no encontrado")
    }

    // Obtener contenido desde Google Drive
    const contenidoDocumento = await getDocumentFromDrive(userId, documento.google_file_id)

    return {
      id: documento.id,
      titulo: documento.titulo,
      contenido: contenidoDocumento.content,
      googleFileId: documento.google_file_id,
      webViewLink: documento.google_view_link,
      expedienteId: documento.expediente_id,
      fechaCreacion: documento.fecha_creacion,
      ultimaModificacion: documento.ultima_modificacion,
    }
  } catch (error) {
    console.error("Error al obtener documento:", error)
    throw error
  }
}

export async function listarDocumentos(expedienteId?: string) {
  const supabase = createServerSupabaseClient()

  // Obtener el usuario actual
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return { documentos: [] }
  }

  try {
    let query = supabase.from("documentos").select("*").order("ultima_modificacion", { ascending: false })

    if (expedienteId) {
      query = query.eq("expediente_id", expedienteId)
    }

    const { data: documentos, error } = await query

    if (error) {
      throw error
    }

    return { documentos: documentos || [] }
  } catch (error) {
    console.error("Error al listar documentos:", error)
    return { documentos: [] }
  }
}
