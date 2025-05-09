import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { obtenerDocumento } from "../actions"
import EditorDocumento from "@/components/documentos/editor-documento"
import { ArrowLeft } from "lucide-react"

interface DocumentoPageProps {
  params: {
    id: string
  }
}

function DocumentoSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-3/4"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>
  )
}

async function DocumentoEditor({ id }: { id: string }) {
  try {
    const documento = await obtenerDocumento(id)

    return (
      <EditorDocumento
        documentoId={id}
        titulo={documento.titulo}
        contenido={documento.contenido}
        expedienteId={documento.expedienteId}
      />
    )
  } catch (error) {
    console.error("Error al cargar documento:", error)
    notFound()
  }
}

export default function DocumentoPage({ params }: DocumentoPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/documentos">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a Documentos
          </Button>
        </Link>
      </div>

      <Suspense fallback={<DocumentoSkeleton />}>
        <DocumentoEditor id={params.id} />
      </Suspense>
    </div>
  )
}
