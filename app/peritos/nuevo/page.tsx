import { PeritoForm } from "@/components/peritos/perito-form"

// Marcar la página como dinámica
export const dynamic = "force-dynamic"

export default function NuevoPeritoPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Nuevo Perito</h1>
      <PeritoForm />
    </div>
  )
}
