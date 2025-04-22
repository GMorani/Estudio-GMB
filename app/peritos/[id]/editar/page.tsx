import { notFound } from "next/navigation"
import { PeritoForm } from "@/components/peritos/perito-form"
import { createClient } from "@/lib/supabase-client"

export const dynamic = "force-dynamic"

export default async function EditarPeritoPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: perito, error } = await supabase.from("peritos").select("*").eq("id", params.id).single()

  if (error || !perito) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editar Perito</h1>
        <p className="text-muted-foreground">Actualiza la información del perito.</p>
      </div>
      <div className="border rounded-lg p-6">
        <PeritoForm perito={perito} />
      </div>
    </div>
  )
}
