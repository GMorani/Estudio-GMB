"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowRight, Home, RotateCcw } from "lucide-react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Registrar el error en un servicio de análisis de errores
    console.error("Error en la aplicación:", error)
  }, [error])

  // Función segura para reintentar
  const handleReset = () => {
    try {
      if (typeof reset === "function") {
        reset()
      } else {
        // Si reset no es una función, recargamos la página como alternativa
        window.location.reload()
      }
    } catch (e) {
      console.error("Error al intentar reiniciar:", e)
      // Recargamos la página como último recurso
      window.location.reload()
    }
  }

  // Determinar si es un error de redirección
  const isRedirectError =
    error.message === "NEXT_REDIRECT" || error.message === "Redirect" || error.message.includes("redirect")

  if (isRedirectError) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Redirigiendo...</CardTitle>
            <CardDescription>Por favor, espere mientras le redirigimos a la página correcta.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Si no es redirigido automáticamente, haga clic en el botón de abajo.</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/dashboard">
                Ir al Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Ha ocurrido un error</CardTitle>
          </div>
          <CardDescription>Lo sentimos, ha ocurrido un error al procesar tu solicitud.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-destructive/10 p-4 text-destructive">
            <p className="text-sm font-medium">{error.message || "Error desconocido"}</p>
            {error.stack && (
              <details className="mt-2">
                <summary className="text-xs cursor-pointer">Ver detalles</summary>
                <pre className="mt-2 text-xs whitespace-pre-wrap">{error.stack}</pre>
              </details>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Ir al inicio
            </Link>
          </Button>
          <Button onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Intentar de nuevo
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
