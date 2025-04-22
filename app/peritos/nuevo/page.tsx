import { PeritoForm } from "@/components/peritos/perito-form"

export default function NuevoPeritoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nuevo Perito</h1>
        <p className="text-muted-foreground">Completa el formulario para crear un nuevo perito.</p>
      </div>
      <div className="border rounded-lg p-6">
        <PeritoForm />
      </div>
    </div>
  )
}
