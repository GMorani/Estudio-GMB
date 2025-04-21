"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { TareaForm } from "@/components/tareas/tarea-form"

export default function NuevaTareaPage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Nueva Tarea</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formulario de creación</CardTitle>
          <CardDescription>Ingresa la información de la nueva tarea</CardDescription>
        </CardHeader>
        <CardContent>
          <TareaForm onSuccess={() => router.push("/tareas")} />
        </CardContent>
      </Card>
    </div>
  )
}
