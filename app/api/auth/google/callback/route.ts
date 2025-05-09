import { type NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"
import { createServerSupabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")

  if (!code) {
    return NextResponse.json({ error: "Código de autorización no proporcionado" }, { status: 400 })
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    )

    // Intercambiar el código por tokens
    const { tokens } = await oauth2Client.getToken(code)

    // Obtener el usuario actual
    const supabase = createServerSupabase()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const userId = session.user.id

    // Guardar los tokens en la base de datos
    const { data, error } = await supabase
      .from("user_google_tokens")
      .upsert({
        user_id: userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
        updated_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error("Error al guardar tokens:", error)
      return NextResponse.json({ error: "Error al guardar tokens" }, { status: 500 })
    }

    // Redirigir a la página de documentos
    return NextResponse.redirect(new URL("/documentos", request.url))
  } catch (error) {
    console.error("Error en callback de Google:", error)
    return NextResponse.json({ error: "Error en callback de Google" }, { status: 500 })
  }
}
