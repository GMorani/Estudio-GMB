"use client"
import { useRouter, useSearchParams } from "next/navigation"
import EditorDocumento from "@/components/documentos/editor-documento"

export default function NuevoDocumentoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const expedienteId = searchParams.get("expediente_id")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nuevo Documento</h1>
        <p className="text-muted-foreground">Crea un nuevo documento legal que se guardará en Google Drive</p>
      </div>

      <EditorDocumento expedienteId={expedienteId || undefined} />
    </div>
  )
}
