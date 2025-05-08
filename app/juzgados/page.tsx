"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle, AlertCircle, RefreshCw } from "lucide-react"
import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"

// Datos de ejemplo para mostrar en modo desconectado
const juzgadosEjemplo = [
  {
    id: "ejemplo-1",
    nombre: "Juzgado Civil N° 1",
    domicilio: "Talcahuano 550, CABA",
    telefono: "11-1234-5678",
    email: "juzgadocivil1@pjn.gov.ar",
    nombre_juez: "Dr. Juan Martínez",
    nombre_secretario: "Dr. Carlos López",
  },
  {
    id: "ejemplo-2",
    nombre: "Juzgado Civil N° 5",
    domicilio: "Lavalle 1220, CABA",
    telefono: "11-8765-4321",
    email: "juzgadocivil5@pjn.gov.ar",
    nombre_juez: "Dra. María Rodríguez",
    nombre_secretario: "Dra. Laura González",
  },
  {
    id: "ejemplo-3",
    nombre: "Juzgado Comercial N° 3",
    domicilio: "Av. Callao 635, CABA",
    telefono: "11-4567-8912",
    email: "juzgadocomercial3@pjn.gov.ar",
    nombre_juez: "Dr. Roberto Sánchez",
    nombre_secretario: "Dr. Martín Fernández",
  },
]

export default function JuzgadosPage() {
  const [activeTab, setActiveTab] = useState("datos-ejemplo")
  const [filtro, setFiltro] = useState("")

  // Filtrar juzgados según el texto de búsqueda
  const juzgadosFiltrados = juzgadosEjemplo.filter(
    (juzgado) =>
      juzgado.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      juzgado.nombre_juez.toLowerCase().includes(filtro.toLowerCase()) ||
      juzgado.nombre_secretario.toLowerCase().includes(filtro.toLowerCase()),
  )

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
        <h1 className="text-3xl font-bold">Juzgados</h1>
        <Button asChild>
          <Link href="/juzgados/nuevo">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Juzgado
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
              <CardTitle>Juzgados (Datos de Ejemplo)</CardTitle>
              <div className="mt-2">
                <Input
                  placeholder="Buscar por nombre, juez o secretario..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Juez</TableHead>
                      <TableHead>Secretario</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {juzgadosFiltrados.length > 0 ? (
                      juzgadosFiltrados.map((juzgado) => (
                        <TableRow key={juzgado.id}>
                          <TableCell className="font-medium">{juzgado.nombre}</TableCell>
                          <TableCell>{juzgado.nombre_juez}</TableCell>
                          <TableCell>{juzgado.nombre_secretario}</TableCell>
                          <TableCell>{juzgado.telefono}</TableCell>
                          <TableCell>{juzgado.email}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/juzgados/${juzgado.id}`}>Ver detalles</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No se encontraron juzgados que coincidan con el filtro.
                        </TableCell>
                      </TableRow>
                    )}
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
