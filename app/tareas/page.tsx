"use client"

import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// Datos de ejemplo para mostrar en modo desconectado
const expedientesEjemplo = [
  {
    id: "ejemplo-1",
    numero: "123/2023",
    autos: "García c/ Seguros La Protección s/ Daños y Perjuicios",
    fecha_inicio: "2023-03-15",
    estado: { id: 1, nombre: "En trámite", color: "blue" },
    persona: { id: "cliente-1", nombre: "Juan García" },
    tareas: [
      {
        id: "tarea-1",
        descripcion: "Presentar escrito de demanda",
        fecha_vencimiento: "2023-04-01",
        cumplida: false,
      },
      {
        id: "tarea-2",
        descripcion: "Solicitar medida cautelar",
        fecha_vencimiento: "2023-04-10",
        cumplida: false,
      },
    ],
    proximaTarea: {
      id: "tarea-1",
      descripcion: "Presentar escrito de demanda",
      fecha_vencimiento: "2023-04-01",
    },
  },
  {
    id: "ejemplo-2",
    numero: "456/2023",
    autos: "Rodríguez c/ Aseguradora del Sol s/ Cobro de Seguro",
    fecha_inicio: "2023-02-20",
    estado: { id: 2, nombre: "Audiencia fijada", color: "green" },
    persona: { id: "cliente-2", nombre: "María Rodríguez" },
    tareas: [
      {
        id: "tarea-3",
        descripcion: "Preparar documentación para audiencia",
        fecha_vencimiento: "2023-04-05",
        cumplida: false,
      },
    ],
    proximaTarea: {
      id: "tarea-3",
      descripcion: "Preparar documentación para audiencia",
      fecha_vencimiento: "2023-04-05",
    },
  },
  {
    id: "ejemplo-3",
    numero: "789/2023",
    autos: "López c/ Seguros Confianza s/ Daños y Perjuicios",
    fecha_inicio: "2023-01-10",
    estado: { id: 3, nombre: "Prueba", color: "orange" },
    persona: { id: "cliente-3", nombre: "Carlos López" },
    tareas: [
      {
        id: "tarea-4",
        descripcion: "Solicitar pericia médica",
        fecha_vencimiento: "2023-03-30",
        cumplida: false,
      },
      {
        id: "tarea-5",
        descripcion: "Presentar testigos",
        fecha_vencimiento: "2023-04-15",
        cumplida: false,
      },
    ],
    proximaTarea: {
      id: "tarea-4",
      descripcion: "Solicitar pericia médica",
      fecha_vencimiento: "2023-03-30",
    },
  },
]

// Función para formatear fechas
const formatearFecha = (fechaStr) => {
  const fecha = new Date(fechaStr)
  return fecha.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

// Función para determinar si una fecha está próxima a vencer (menos de 7 días)
const estaProximaAVencer = (fechaStr) => {
  const hoy = new Date()
  const fecha = new Date(fechaStr)
  const diferenciaDias = Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24))
  return diferenciaDias >= 0 && diferenciaDias <= 7
}

// Función para determinar si una fecha está vencida
const estaVencida = (fechaStr) => {
  const hoy = new Date()
  const fecha = new Date(fechaStr)
  return fecha < hoy
}

export default function TareasPage() {
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

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tareas Pendientes</h1>
        <p className="text-muted-foreground">
          Expedientes con tareas pendientes, ordenados por fecha de vencimiento más próxima.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="datos-ejemplo">Datos de Ejemplo</TabsTrigger>
          <TabsTrigger value="solucion-problemas">Solución de Problemas</TabsTrigger>
        </TabsList>

        <TabsContent value="datos-ejemplo" className="space-y-4 mt-4">
          <div className="grid gap-4">
            {expedientesEjemplo.map((expediente) => (
              <Card key={expediente.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-medium">
                        <Link href={`/expedientes/${expediente.id}`} className="hover:underline">
                          {expediente.autos}
                        </Link>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Expediente N° {expediente.numero} | Cliente: {expediente.persona.nombre}
                      </p>
                    </div>
                    <Badge
                      style={{
                        backgroundColor:
                          expediente.estado.color === "blue"
                            ? "#3b82f6"
                            : expediente.estado.color === "green"
                              ? "#22c55e"
                              : expediente.estado.color === "orange"
                                ? "#f97316"
                                : "#6b7280",
                      }}
                    >
                      {expediente.estado.nombre}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold mb-2">Tareas pendientes:</h3>
                  <ul className="space-y-2">
                    {expediente.tareas.map((tarea) => (
                      <li key={tarea.id} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">{tarea.descripcion}</p>
                          <p
                            className={`text-sm ${
                              estaVencida(tarea.fecha_vencimiento)
                                ? "text-red-600 font-semibold"
                                : estaProximaAVencer(tarea.fecha_vencimiento)
                                  ? "text-amber-600"
                                  : "text-muted-foreground"
                            }`}
                          >
                            Vence: {formatearFecha(tarea.fecha_vencimiento)}
                            {estaVencida(tarea.fecha_vencimiento) && " (VENCIDA)"}
                            {!estaVencida(tarea.fecha_vencimiento) &&
                              estaProximaAVencer(tarea.fecha_vencimiento) &&
                              " (PRÓXIMA)"}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/expedientes/${expediente.id}`}>Ver expediente completo</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
