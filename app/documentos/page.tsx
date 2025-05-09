import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { listarDocumentos } from "./actions"
import { FileText, Plus } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

function DocumentosSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="pb-2">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          </CardHeader>
          <CardContent>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

async function DocumentosList() {
  const { documentos } = await listarDocumentos()

  if (documentos.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">No hay documentos disponibles.</p>
          <p className="mt-2">Crea tu primer documento haciendo clic en el botón "Nuevo Documento".</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {documentos.map((documento) => (
        <Card key={documento.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-500" />
              <Link href={`/documentos/${documento.id}`} className="hover:underline">
                {documento.titulo || "Documento sin título"}
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Última modificación:{" "}
              {documento.ultima_modificacion
                ? formatDistanceToNow(new Date(documento.ultima_modificacion), {
                    addSuffix: true,
                    locale: es,
                  })
                : "Fecha desconocida"}
            </div>
            {documento.expediente_id && (
              <div className="text-sm mt-1">
                <Link href={`/expedientes/${documento.expediente_id}`} className="text-blue-500 hover:underline">
                  Ver expediente relacionado
                </Link>
              </div>
            )}
            <div className="mt-2">
              <a
                href={documento.google_view_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:underline"
              >
                Abrir en Google Docs
              </a>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function DocumentosPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Documentos</h1>
          <p className="text-muted-foreground">Gestiona tus documentos legales sincronizados con Google Drive</p>
        </div>
        <Link href="/documentos/nuevo">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Documento
          </Button>
        </Link>
      </div>

      <Suspense fallback={<DocumentosSkeleton />}>
        <DocumentosList />
      </Suspense>
    </div>
  )
}
