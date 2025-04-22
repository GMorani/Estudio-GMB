import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { formatDate } from "@/lib/utils"

// Marcar la página como dinámica
export const dynamic = "force-dynamic"

export default async function DiagnosticoExpedientesPage() {
  const supabase = createServerComponentClient({ cookies })

  // Consultar todos los expedientes
  const { data: expedientes, error: expedientesError } = await supabase
    .from("expedientes")
    .select("*")
    .order("fecha_inicio", { ascending: false })

  // Consultar las relaciones expediente-persona
  const { data: expedientePersonas, error: relacionesError } = await supabase
    .from("expediente_personas")
    .select("expediente_id, persona_id, rol")

  // Consultar los estados de expedientes
  const { data: expedienteEstados, error: estadosError } = await supabase
    .from("expediente_estados")
    .select("expediente_id, estado_id")

  // Consultar los tipos de estados
  const { data: tiposEstados, error: tiposEstadosError } = await supabase
    .from("estados_expediente")
    .select("id, nombre, color")

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/diagnostico">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold mb-2">Diagnóstico de Expedientes</h1>
          <p className="text-muted-foreground">
            Esta página muestra información directa de la base de datos para ayudar a diagnosticar problemas con los
            expedientes.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Expedientes ({expedientes?.length || 0})</h2>
        {expedientesError ? (
          <p className="text-red-500">Error al cargar expedientes: {expedientesError.message}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded-md">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Número</th>
                  <th className="px-4 py-2 text-left">Fecha Inicio</th>
                  <th className="px-4 py-2 text-left">Monto Total</th>
                  <th className="px-4 py-2 text-left">Juzgado ID</th>
                  <th className="px-4 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {expedientes?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-2 text-center">
                      No se encontraron expedientes
                    </td>
                  </tr>
                ) : (
                  expedientes?.map((expediente) => (
                    <tr key={expediente.id} className="border-t">
                      <td className="px-4 py-2">{expediente.id}</td>
                      <td className="px-4 py-2">{expediente.numero}</td>
                      <td className="px-4 py-2">{formatDate(expediente.fecha_inicio)}</td>
                      <td className="px-4 py-2">{expediente.monto_total}</td>
                      <td className="px-4 py-2">{expediente.juzgado_id || "-"}</td>
                      <td className="px-4 py-2">
                        <Link href={`/expedientes/${expediente.id}`} className="text-blue-500 hover:underline">
                          Ver
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Relaciones Expediente-Persona ({expedientePersonas?.length || 0})</h2>
        {relacionesError ? (
          <p className="text-red-500">Error al cargar relaciones: {relacionesError.message}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded-md">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left">Expediente ID</th>
                  <th className="px-4 py-2 text-left">Persona ID</th>
                  <th className="px-4 py-2 text-left">Rol</th>
                </tr>
              </thead>
              <tbody>
                {expedientePersonas?.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-center">
                      No se encontraron relaciones
                    </td>
                  </tr>
                ) : (
                  expedientePersonas?.map((relacion, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2">{relacion.expediente_id}</td>
                      <td className="px-4 py-2">{relacion.persona_id}</td>
                      <td className="px-4 py-2">{relacion.rol}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Estados de Expedientes ({expedienteEstados?.length || 0})</h2>
        {estadosError ? (
          <p className="text-red-500">Error al cargar estados: {estadosError.message}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded-md">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left">Expediente ID</th>
                  <th className="px-4 py-2 text-left">Estado ID</th>
                  <th className="px-4 py-2 text-left">Nombre Estado</th>
                </tr>
              </thead>
              <tbody>
                {expedienteEstados?.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-center">
                      No se encontraron estados
                    </td>
                  </tr>
                ) : (
                  expedienteEstados?.map((estado, index) => {
                    const tipoEstado = tiposEstados?.find((t) => t.id === estado.estado_id)
                    return (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">{estado.expediente_id}</td>
                        <td className="px-4 py-2">{estado.estado_id}</td>
                        <td className="px-4 py-2">{tipoEstado?.nombre || "-"}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Tipos de Estados ({tiposEstados?.length || 0})</h2>
        {tiposEstadosError ? (
          <p className="text-red-500">Error al cargar tipos de estados: {tiposEstadosError.message}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded-md">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Nombre</th>
                  <th className="px-4 py-2 text-left">Color</th>
                </tr>
              </thead>
              <tbody>
                {tiposEstados?.map((tipo) => (
                  <tr key={tipo.id} className="border-t">
                    <td className="px-4 py-2">{tipo.id}</td>
                    <td className="px-4 py-2">{tipo.nombre}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tipo.color }}></div>
                        {tipo.color}
                      </div>
                    </td>
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
