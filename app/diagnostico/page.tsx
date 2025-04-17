import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

// Marcar la página como dinámica
export const dynamic = "force-dynamic"

export default async function DiagnosticoPage() {
  const supabase = createServerComponentClient({ cookies })

  // Consultar todas las personas
  const { data: personas, error: personasError } = await supabase.from("personas").select("*").order("nombre")

  // Consultar específicamente los clientes
  const { data: clientes, error: clientesError } = await supabase
    .from("personas")
    .select(`
      id,
      nombre,
      dni_cuit,
      tipo_id,
      clientes (*)
    `)
    .eq("tipo_id", 1) // Tipo cliente
    .order("nombre")

  // Consultar los tipos de persona
  const { data: tiposPersona, error: tiposError } = await supabase.from("tipos_persona").select("*")

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">Diagnóstico de Base de Datos</h1>
        <p className="text-muted-foreground">
          Esta página muestra información directa de la base de datos para ayudar a diagnosticar problemas.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Tipos de Persona</h2>
        {tiposError ? (
          <p className="text-red-500">Error al cargar tipos: {tiposError.message}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded-md">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Nombre</th>
                </tr>
              </thead>
              <tbody>
                {tiposPersona?.map((tipo) => (
                  <tr key={tipo.id} className="border-t">
                    <td className="px-4 py-2">{tipo.id}</td>
                    <td className="px-4 py-2">{tipo.nombre}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Clientes (tipo_id = 1)</h2>
        {clientesError ? (
          <p className="text-red-500">Error al cargar clientes: {clientesError.message}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded-md">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Nombre</th>
                  <th className="px-4 py-2 text-left">DNI/CUIT</th>
                  <th className="px-4 py-2 text-left">Tipo ID</th>
                  <th className="px-4 py-2 text-left">Registro en tabla clientes</th>
                </tr>
              </thead>
              <tbody>
                {clientes?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-2 text-center">
                      No se encontraron clientes
                    </td>
                  </tr>
                ) : (
                  clientes?.map((cliente) => (
                    <tr key={cliente.id} className="border-t">
                      <td className="px-4 py-2">{cliente.id}</td>
                      <td className="px-4 py-2">{cliente.nombre}</td>
                      <td className="px-4 py-2">{cliente.dni_cuit}</td>
                      <td className="px-4 py-2">{cliente.tipo_id}</td>
                      <td className="px-4 py-2">{cliente.clientes ? "Sí" : "No"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Todas las Personas</h2>
        {personasError ? (
          <p className="text-red-500">Error al cargar personas: {personasError.message}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded-md">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Nombre</th>
                  <th className="px-4 py-2 text-left">DNI/CUIT</th>
                  <th className="px-4 py-2 text-left">Tipo ID</th>
                </tr>
              </thead>
              <tbody>
                {personas?.map((persona) => (
                  <tr key={persona.id} className="border-t">
                    <td className="px-4 py-2">{persona.id}</td>
                    <td className="px-4 py-2">{persona.nombre}</td>
                    <td className="px-4 py-2">{persona.dni_cuit}</td>
                    <td className="px-4 py-2">{persona.tipo_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
