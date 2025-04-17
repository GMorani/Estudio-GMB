import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { PersonasTable } from "@/components/personas/personas-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

export default async function PersonasPage() {
  const supabase = createServerComponentClient({ cookies })

  // Obtener todos los tipos de persona
  const { data: tiposPersona } = await supabase.from("tipos_persona").select("id, nombre").order("nombre")

  // Obtener todas las personas con su tipo
  const { data: personas, error } = await supabase
    .from("personas")
    .select(`
      id,
      nombre,
      dni_cuit,
      telefono,
      email,
      domicilio,
      tipo_id,
      tipos_persona (
        nombre
      )
    `)
    .order("nombre")

  if (error) {
    console.error("Error al cargar personas:", error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Personas</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/personas/nuevo-tipo">Nuevo Tipo</Link>
          </Button>
          <Button asChild>
            <Link href="/personas/nuevo">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nueva Persona
            </Link>
          </Button>
        </div>
      </div>

      <PersonasTable personas={personas || []} tiposPersona={tiposPersona || []} />
    </div>
  )
}
