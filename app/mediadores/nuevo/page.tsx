import { MediadorForm } from "@/components/mediadores/mediador-form"

// Marcar la página como dinámica
export const dynamic = "force-dynamic"

export default function NuevoMediadorPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Nuevo Mediador</h1>
      <MediadorForm />
    </div>
  )
}
