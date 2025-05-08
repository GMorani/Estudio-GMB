"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle, AlertTriangle, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Datos de ejemplo para mostrar en modo estático
const EXPEDIENTES_EJEMPLO = [
  {
    id: "ejemplo-1",
    numero: "2023-001",
    autos: "Pérez c/ Aseguradora XYZ",
    estado: "En trámite",
    fecha_alta: "15/01/2023",
    juzgado: "1° Juzgado Civil",
  },
  {
    id: "ejemplo-2",
    numero: "2023-002",
    autos: "Rodríguez c/ Compañía ABC",
    estado: "Pendiente",
    fecha_alta: "22/02/2023",
    juzgado: "3° Juzgado Comercial",
  },
  {
    id: "ejemplo-3",
    numero: "2023-003",
    autos: "González c/ Empresa 123",
    estado: "Finalizado",
    fecha_alta: "10/03/2023",
    juzgado: "2° Juzgado Civil",
  },
]

// Componente de tabla estática
function TablaEstatica() {
  return (
    <div className="rounded-md border">
      <div className="relative w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Número</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Autos</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Estado</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Fecha Alta</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Juzgado</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {EXPEDIENTES_EJEMPLO.map((expediente) => (
              <tr
                key={expediente.id}
                className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
              >
                <td className="p-4 align-middle">{expediente.numero}</td>
                <td className="p-4 align-middle font-medium">{expediente.autos}</td>
                <td className="p-4 align-middle">
                  <Badge variant={expediente.estado === "Finalizado" ? "outline" : "default"}>
                    {expediente.estado}
                  </Badge>
                </td>
                <td className="p-4 align-middle">{expediente.fecha_alta}</td>
                <td className="p-4 align-middle">{expediente.juzgado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Componente de solución de problemas
function SolucionProblemas() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Solución de problemas de conexión</CardTitle>
        <CardDescription>Sigue estos pasos para resolver problemas de conexión con la base de datos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-medium">1. Verifica tu conexión a internet</h3>
          <p className="text-sm text-muted-foreground">
            Asegúrate de tener una conexión estable a internet. Intenta navegar a otros sitios web para confirmar.
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="font-medium">2. Verifica el estado de Supabase</h3>
          <p className="text-sm text-muted-foreground">
            Visita la página de estado de Supabase para verificar si hay alguna interrupción del servicio.
          </p>
          <Button variant="outline" size="sm" asChild>
            <a href="https://status.supabase.com/" target="_blank" rel="noopener noreferrer">
              Estado de Supabase <ExternalLink className="ml-2 h-3 w-3" />
            </a>
          </Button>
        </div>
        <div className="space-y-2">
          <h3 className="font-medium">3. Verifica las variables de entorno</h3>
          <p className="text-sm text-muted-foreground">
            Asegúrate de que las variables de entorno de Supabase estén configuradas correctamente en tu proyecto.
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="font-medium">4. Contacta al soporte técnico</h3>
          <p className="text-sm text-muted-foreground">
            Si el problema persiste, contacta al soporte técnico para obtener ayuda.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => window.location.reload()}>Recargar página</Button>
      </CardFooter>
    </Card>
  )
}

// Componente principal
export default function ExpedientesPage() {
  const [activeTab, setActiveTab] = useState("vista")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Expedientes</h1>
        <Button asChild>
          <Link href="/expedientes/nuevo">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Expediente
          </Link>
        </Button>
      </div>

      <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-900">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
          <div>
            <h3 className="font-medium">Modo de visualización limitada</h3>
            <p className="text-sm mt-1">
              Debido a problemas de conexión con la base de datos, estás viendo una versión limitada de esta página con
              datos de ejemplo. Consulta la pestaña "Solución de problemas" para obtener ayuda.
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="vista">Vista de ejemplo</TabsTrigger>
          <TabsTrigger value="solucion">Solución de problemas</TabsTrigger>
        </TabsList>
        <TabsContent value="vista" className="mt-4">
          <TablaEstatica />
        </TabsContent>
        <TabsContent value="solucion" className="mt-4">
          <SolucionProblemas />
        </TabsContent>
      </Tabs>
    </div>
  )
}
