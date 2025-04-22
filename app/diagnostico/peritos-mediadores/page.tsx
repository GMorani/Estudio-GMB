import { createClient } from "@/lib/supabase"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function DiagnosticoPeritosMediadoresPage() {
  const supabase = createClient()

  // Verificar tablas
  const { data: peritosTable } = await supabase
    .from("peritos")
    .select("count")
    .single()
    .catch(() => ({ data: null }))

  const { data: mediadoresTable } = await supabase
    .from("mediadores")
    .select("count")
    .single()
    .catch(() => ({ data: null }))

  // Verificar rutas
  const routes = [
    { name: "Peritos", path: "/peritos", exists: true },
    { name: "Mediadores", path: "/mediadores", exists: true },
  ]

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold">Diagnóstico de Peritos y Mediadores</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Estado de las Tablas</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="font-medium">Tabla Peritos</span>
              <span className={peritosTable ? "text-green-600" : "text-red-600"}>
                {peritosTable ? "Existe" : "No existe"}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="font-medium">Tabla Mediadores</span>
              <span className={mediadoresTable ? "text-green-600" : "text-red-600"}>
                {mediadoresTable ? "Existe" : "No existe"}
              </span>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Estado de las Rutas</h2>
          <div className="space-y-4">
            {routes.map((route) => (
              <div key={route.path} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium">{route.name}</span>
                <div className="flex items-center gap-3">
                  <span className={route.exists ? "text-green-600" : "text-red-600"}>
                    {route.exists ? "Disponible" : "No disponible"}
                  </span>
                  {route.exists && (
                    <Button asChild size="sm">
                      <Link href={route.path}>Visitar</Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Acciones de Corrección</h2>
        <div className="space-y-4">
          {!peritosTable && (
            <div className="p-3 bg-yellow-50 rounded">
              <p className="font-medium text-yellow-800 mb-2">La tabla de Peritos no existe</p>
              <p className="text-sm text-yellow-700 mb-3">
                Es necesario crear la tabla de peritos en la base de datos para que la funcionalidad esté disponible.
              </p>
              <Button variant="outline" asChild>
                <Link href="/diagnostico/crear-tablas">Crear Tablas</Link>
              </Button>
            </div>
          )}

          {!mediadoresTable && (
            <div className="p-3 bg-yellow-50 rounded">
              <p className="font-medium text-yellow-800 mb-2">La tabla de Mediadores no existe</p>
              <p className="text-sm text-yellow-700 mb-3">
                Es necesario crear la tabla de mediadores en la base de datos para que la funcionalidad esté disponible.
              </p>
              <Button variant="outline" asChild>
                <Link href="/diagnostico/crear-tablas">Crear Tablas</Link>
              </Button>
            </div>
          )}

          {peritosTable && mediadoresTable && (
            <div className="p-3 bg-green-50 rounded">
              <p className="font-medium text-green-800">Todo está configurado correctamente</p>
              <p className="text-sm text-green-700">
                Las tablas existen y las rutas están disponibles. Si sigues teniendo problemas, puede ser un problema de
                permisos o de navegación.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button asChild>
          <Link href="/dashboard">Volver al Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
