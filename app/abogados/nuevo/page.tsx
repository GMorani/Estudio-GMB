import { AbogadoForm } from "@/components/abogados/abogado-form"

// Marcar la página como dinámica
export const dynamic = "force-dynamic"

export default function NuevoAbogadoPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Nuevo Abogado</h1>
      <AbogadoForm />
    </div>
  )
}
