"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { guardarDocumento } from "@/app/documentos/actions"
import { Loader2, Save } from "lucide-react"

// Importar ReactQuill dinámicamente para evitar errores de SSR
const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => (
    <div className="h-64 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  ),
})

// Importar los estilos de Quill
import "react-quill/dist/quill.snow.css"

interface EditorDocumentoProps {
  documentoId?: string
  titulo?: string
  contenido?: string
  expedienteId?: string
}

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ align: [] }],
    ["link"],
    ["clean"],
  ],
}

const formats = ["header", "bold", "italic", "underline", "strike", "list", "bullet", "indent", "align", "link"]

export default function EditorDocumento({
  documentoId,
  titulo: tituloInicial = "",
  contenido: contenidoInicial = "",
  expedienteId,
}: EditorDocumentoProps) {
  const [titulo, setTitulo] = useState(tituloInicial)
  const [contenido, setContenido] = useState(contenidoInicial)
  const [guardando, setGuardando] = useState(false)
  const [inicializado, setInicializado] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Asegurarse de que el estado se inicialice correctamente después de la carga
    if (!inicializado && (tituloInicial || contenidoInicial)) {
      setTitulo(tituloInicial)
      setContenido(contenidoInicial)
      setInicializado(true)
    }
  }, [tituloInicial, contenidoInicial, inicializado])

  const handleGuardar = async () => {
    if (!titulo) {
      toast({
        title: "Error",
        description: "Por favor, ingresa un título para el documento",
        variant: "destructive",
      })
      return
    }

    setGuardando(true)
    try {
      const resultado = await guardarDocumento({
        documentoId,
        titulo,
        contenido,
        expedienteId,
      })

      toast({
        title: "Documento guardado",
        description: "El documento se ha guardado correctamente en Google Drive",
      })

      // Si es un documento nuevo, redirigir a la página de edición
      if (!documentoId && resultado.documentoId) {
        window.location.href = `/documentos/${resultado.documentoId}`
      }
    } catch (error) {
      console.error("Error al guardar documento:", error)
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar el documento. Por favor, intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle>
          <Input
            placeholder="Título del documento"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="text-xl font-bold"
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          {typeof window !== "undefined" && (
            <ReactQuill
              theme="snow"
              value={contenido}
              onChange={setContenido}
              modules={modules}
              formats={formats}
              className="min-h-[300px]"
            />
          )}
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={handleGuardar} disabled={guardando} className="flex items-center gap-2">
            {guardando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Guardar en Google Drive
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
