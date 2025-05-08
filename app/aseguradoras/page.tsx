"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle, AlertCircle, RefreshCw } from "lucide-react"
import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Datos de ejemplo para mostrar en modo desconectado
const aseguradorasEjemplo = [
  {
    id: "ejemplo-1",
    nombre: "Seguros La Protección",
    dni_cuit: "30-12345678-9",
    domicilio: "Av. Corrientes 1234, CABA",
    telefono: "11-1234-5678",
    email: "contacto@laproteccion.com",
  },
  {
    id: "ejemplo-2",
    nombre: "Aseguradora del Sol",
    dni_cuit: "30-87654321-0",
    domicilio: "Av. Santa Fe 4321, CABA",
    telefono: "11-8765-4321",
    email: "info@aseguradoradelsol.com",
  },
  {
    id: "ejemplo-3",
    nombre: "Seguros Confianza",
    dni_cuit: "30-45678912-3",
    domicilio: "Av. Cabildo 789, CABA",
    telefono: "11-4567-8912",
    email: "atencion@segurosconfianza.com",
  },
]

export default function AseguradorasPage() {
  const [activeTab, setActiveTab] = useState("datos-ejemplo")

  return (
    <div className="space-y-6">
      <Alert className="bg-amber-50 border-amber-200 text-amber-800">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Modo desconectado</AlertTitle>
        <AlertDescription>
          No se pudo establecer conexión con la base de datos. Se está mostrando una versión limitada con datos de
          ejemplo.
          <button
            onClick={() => window.location.reload()}
            className="ml-2 inline-flex items-center text-sm font-medium text-amber-800 hover:text-amber-900"
          >
            <RefreshCw className="mr-1 h-3 w-3" />
            Reintentar conexión
          </button>
        </AlertDescription>
      </Alert>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Aseguradoras</h1>
        <Button asChild>
          <Link href="/aseguradoras/nuevo">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nueva Aseguradora
          </Link>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="datos-ejemplo">Datos de Ejemplo</TabsTrigger>
          <TabsTrigger value="solucion-problemas">Solución de Problemas</TabsTrigger>
        </TabsList>

        <TabsContent value="datos-ejemplo" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Aseguradoras (Datos de Ejemplo)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>CUIT</TableHead>
                      <TableHead>Domicilio</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aseguradorasEjemplo.map((aseguradora) => (
                      <TableRow key={aseguradora.id}>
                        <TableCell className="font-medium">{aseguradora.nombre}</TableCell>
                        <TableCell>{aseguradora.dni_cuit}</TableCell>
                        <TableCell>{aseguradora.domicilio}</TableCell>
                        <TableCell>{aseguradora.telefono}</TableCell>
                        <TableCell>{aseguradora.email}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/aseguradoras/${aseguradora.id}`}>Ver detalles</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="solucion-problemas" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Solución de Problemas de Conexión</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Se ha detectado un problema al conectar con la base de datos Supabase. A continuación se presentan
                algunos pasos para solucionar este problema:
              </p>

              <div className="space-y-2">
                <h3 className="font-semibold">1. Verificar la conexión a internet</h3>
                <p>Asegúrese de que su dispositivo tiene una conexión a internet estable.</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">2. Verificar las variables de entorno</h3>
                <p>
                  Compruebe que las variables de entorno de Supabase están correctamente configuradas en el proyecto.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">3. Verificar el estado de Supabase</h3>
                <p>
                  Compruebe si hay algún problema conocido con el servicio de Supabase visitando su{" "}
                  <a
                    href="https://status.supabase.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    página de estado
                  </a>
                  .
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">4. Reiniciar la aplicación</h3>
                <p>A veces, reiniciar la aplicación puede resolver problemas temporales de conexión.</p>
                <Button onClick={() => window.location.reload()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Recargar la página
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
