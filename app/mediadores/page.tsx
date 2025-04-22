import { createClient } from "@/lib/supabase"

export default async function MediadoresPage() {
  const supabase = createClient()
  const { data: mediadores, error } = await supabase.from("mediadores").select("*")

  if (error) {
    return <div>Error al cargar mediadores: {error.message}</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Mediadores</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Nombre</th>
              <th className="py-2 px-4 border-b">Teléfono</th>
              <th className="py-2 px-4 border-b">Email</th>
            </tr>
          </thead>
          <tbody>
            {mediadores?.map((mediador) => (
              <tr key={mediador.id}>
                <td className="py-2 px-4 border-b">{mediador.nombre}</td>
                <td className="py-2 px-4 border-b">{mediador.telefono}</td>
                <td className="py-2 px-4 border-b">{mediador.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
