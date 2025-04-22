"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

// Definición de las rutas que deberían existir
const expectedRoutes = [
  "/dashboard",
  "/expedientes",
  "/tareas",
  "/clientes",
  "/abogados",
  "/aseguradoras",
  "/juzgados",
  "/peritos",
  "/mediadores",
  "/calendario",
  "/configuracion",
]

// Componente para validar rutas
export function RouteValidator() {
  const router = useRouter()
  const [results, setResults] = useState<{ route: string; exists: boolean }[]>([])
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkRoutes = async () => {
      const checkResults = await Promise.all(
        expectedRoutes.map(async (route) => {
          try {
            // Intentamos hacer una solicitud a la ruta
            const response = await fetch(route)
            return {
              route,
              exists: response.status !== 404,
            }
          } catch (error) {
            console.error(`Error checking route ${route}:`, error)
            return { route, exists: false }
          }
        }),
      )

      setResults(checkResults)
      setChecking(false)
    }

    checkRoutes()
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Validación de Rutas</h1>

      {checking ? (
        <p>Comprobando rutas...</p>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {results.map(({ route, exists }) => (
              <div key={route} className={`p-4 rounded-md ${exists ? "bg-green-100" : "bg-red-100"}`}>
                <p className="font-medium">{route}</p>
                <p className={exists ? "text-green-600" : "text-red-600"}>
                  {exists ? "Funciona correctamente" : "No encontrada"}
                </p>
                {exists && (
                  <button
                    onClick={() => router.push(route)}
                    className="mt-2 px-3 py-1 bg-blue-500 text-white rounded-md text-sm"
                  >
                    Visitar
                  </button>
                )}
              </div>
            ))}
          </div>

          {results.some((r) => !r.exists) && (
            <div className="mt-6 p-4 bg-yellow-100 rounded-md">
              <h2 className="font-bold text-lg mb-2">Rutas con problemas:</h2>
              <ul className="list-disc pl-5">
                {results
                  .filter((r) => !r.exists)
                  .map(({ route }) => (
                    <li key={route}>{route}</li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
