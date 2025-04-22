import { MediadorForm } from "@/components/mediadores/mediador-form"

export default function NuevoMediadorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nuevo Mediador</h1>
        <p className="text-muted-foreground">Completa el formulario para crear un nuevo mediador.</p>
      </div>
      <div className="border rounded-lg p-6">
        <MediadorForm />
      </div>
    </div>
  )
}
