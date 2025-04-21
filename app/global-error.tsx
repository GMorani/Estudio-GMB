"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Home, RotateCcw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Registrar el error en un servicio de análisis de errores
    console.error("Error global en la aplicación:", error)
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

  return (
    <html>
      <body>
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <CardTitle>Error crítico</CardTitle>
              </div>
              <CardDescription>Lo sentimos, ha ocurrido un error crítico en la aplicación.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md bg-destructive/10 p-4 text-destructive">
                <p className="text-sm font-medium">{error.message || "Error desconocido"}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => (window.location.href = "/dashboard")}>
                <Home className="mr-2 h-4 w-4" />
                Ir al inicio
              </Button>
              <Button onClick={handleReset}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Intentar de nuevo
              </Button>
            </CardFooter>
          </Card>
        </div>
      </body>
    </html>
  )
}
