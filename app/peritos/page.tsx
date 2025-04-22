import { createClient } from "@/lib/supabase"

export default async function PeritosPage() {
  const supabase = createClient()
  const { data: peritos, error } = await supabase.from("peritos").select("*")

  if (error) {
    return <div>Error al cargar peritos: {error.message}</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Peritos</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Nombre</th>
              <th className="py-2 px-4 border-b">Especialidad</th>
              <th className="py-2 px-4 border-b">Teléfono</th>
              <th className="py-2 px-4 border-b">Email</th>
            </tr>
          </thead>
          <tbody>
            {peritos?.map((perito) => (
              <tr key={perito.id}>
                <td className="py-2 px-4 border-b">{perito.nombre}</td>
                <td className="py-2 px-4 border-b">{perito.especialidad}</td>
                <td className="py-2 px-4 border-b">{perito.telefono}</td>
                <td className="py-2 px-4 border-b">{perito.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
