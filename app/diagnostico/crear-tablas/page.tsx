"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function CrearTablasPage() {
  const [isCreating, setIsCreating] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const router = useRouter()

  const crearTablas = async () => {
    setIsCreating(true)
    setResult(null)

    try {
      const supabase = createClient()

      // Crear tabla de peritos si no existe
      const { error: peritosError } = await supabase.rpc("crear_tabla_peritos")

      // Crear tabla de mediadores si no existe
      const { error: mediadoresError } = await supabase.rpc("crear_tabla_mediadores")

      if (peritosError || mediadoresError) {
        setResult({
          success: false,
          message: `Error al crear tablas: ${peritosError?.message || mediadoresError?.message}`,
        })
      } else {
        setResult({
          success: true,
          message: "Tablas creadas correctamente",
        })

        // Refrescar la caché de la aplicación
        router.refresh()
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Error inesperado: ${error instanceof Error ? error.message : String(error)}`,
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Crear Tablas</h1>
        <p className="text-muted-foreground">
          Esta herramienta creará las tablas necesarias para Peritos y Mediadores en la base de datos.
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <h2 className="font-semibold text-yellow-800 mb-2">Información Importante</h2>
        <p className="text-sm text-yellow-700">
          Esta acción intentará crear las tablas de peritos y mediadores en la base de datos si no existen. Es necesario
          tener los permisos adecuados en la base de datos para realizar esta operación.
        </p>
      </div>

      <div className="flex justify-center">
        <Button onClick={crearTablas} disabled={isCreating} className="w-full max-w-xs">
          {isCreating ? "Creando tablas..." : "Crear Tablas"}
        </Button>
      </div>

      {result && (
        <div
          className={`p-4 rounded-md ${result.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
        >
          <p className={`font-medium ${result.success ? "text-green-800" : "text-red-800"}`}>
            {result.success ? "✅ " : "❌ "}
            {result.message}
          </p>
          {result.success && (
            <div className="mt-4 flex justify-center">
              <Button variant="outline" onClick={() => router.push("/diagnostico/peritos-mediadores")}>
                Verificar Tablas
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <Button variant="outline" onClick={() => router.back()}>
          Volver
        </Button>
      </div>
    </div>
  )
}
