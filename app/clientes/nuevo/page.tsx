"use client"

import { ClienteForm } from "@/components/clientes/cliente-form"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

// Marcar la página como dinámica
export const dynamic = "force-dynamic"

export default function NuevoClientePage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Nuevo Cliente</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formulario de creación</CardTitle>
          <CardDescription>Ingresa la información del nuevo cliente</CardDescription>
        </CardHeader>
        <CardContent>
          <ClienteForm />
        </CardContent>
      </Card>
    </div>
  )
}
