import { JuzgadoForm } from "@/components/juzgados/juzgado-form"

// Marcar la página como dinámica
export const dynamic = "force-dynamic"

export default function NuevoJuzgadoPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Nuevo Juzgado</h1>
      <JuzgadoForm />
    </div>
  )
}
