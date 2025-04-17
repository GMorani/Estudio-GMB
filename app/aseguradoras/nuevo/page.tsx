import { AseguradoraForm } from "@/components/aseguradoras/aseguradora-form"

// Marcar la página como dinámica
export const dynamic = "force-dynamic"
// Asegurar que la página siempre se renderice con datos frescos
export const revalidate = 0

export default function NuevaAseguradoraPage() {
  console.log("Renderizando página de nueva aseguradora")

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Nueva Aseguradora</h1>
      <AseguradoraForm />
    </div>
  )
}
