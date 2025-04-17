import { AseguradoraForm } from "@/components/aseguradoras/aseguradora-form"

// Marcar la página como dinámica
export const dynamic = "force-dynamic"

export default function NuevaAseguradoraPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Nueva Aseguradora</h1>
      <AseguradoraForm />
    </div>
  )
}
