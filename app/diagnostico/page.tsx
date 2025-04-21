"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, ArrowRight, Clock, FileText, Users, Calendar, BarChart4 } from "lucide-react"

export default function DiagnosticoPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("expedientes")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Diagnóstico del Sistema</h1>
        <p className="text-muted-foreground">
          Herramientas de diagnóstico para identificar problemas y optimizar el uso del sistema.
        </p>
      </div>

      <Tabs defaultValue="expedientes" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="expedientes">
            <FileText className="mr-2 h-4 w-4" />
            Expedientes
          </TabsTrigger>
          <TabsTrigger value="clientes">
            <Users className="mr-2 h-4 w-4" />
            Clientes
          </TabsTrigger>
          <TabsTrigger value="estadisticas">
            <BarChart4 className="mr-2 h-4 w-4" />
            Estadísticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expedientes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Diagnóstico de Expedientes</CardTitle>
              <CardDescription>Identifica expedientes que requieren atención o seguimiento.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Expedientes sin actividad</CardTitle>
                  <CardDescription>Expedientes que no han tenido actividad en los últimos 30 días.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/diagnostico/expedientes?tab=sin-actividad")}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Ver expedientes sin actividad
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Expedientes sin tareas</CardTitle>
                  <CardDescription>Expedientes que no tienen tareas pendientes asignadas.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/diagnostico/expedientes?tab=sin-tareas")}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Ver expedientes sin tareas
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Tareas vencidas</CardTitle>
                  <CardDescription>Expedientes con tareas pendientes vencidas.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/diagnostico/expedientes?tab=tareas-vencidas")}
                  >
                    <AlertCircle className="mr-2 h-4 w-4 text-destructive" />
                    Ver tareas vencidas
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Sin cliente asignado</CardTitle>
                  <CardDescription>Expedientes que no tienen ningún cliente asociado.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/diagnostico/expedientes?tab=sin-cliente")}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Ver expedientes sin cliente
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clientes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Diagnóstico de Clientes</CardTitle>
              <CardDescription>Identifica clientes que requieren atención o seguimiento.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Clientes sin expedientes</CardTitle>
                  <CardDescription>Clientes que no tienen expedientes asociados.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/diagnostico/clientes?tab=sin-expedientes")}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Ver clientes sin expedientes
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Clientes inactivos</CardTitle>
                  <CardDescription>Clientes sin actividad en los últimos 90 días.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/diagnostico/clientes?tab=inactivos")}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Ver clientes inactivos
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estadisticas" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas del Sistema</CardTitle>
              <CardDescription>Métricas y estadísticas generales del sistema.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Estadísticas de expedientes</CardTitle>
                  <CardDescription>Métricas sobre expedientes por estado, tipo y más.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" onClick={() => router.push("/estadisticas/expedientes")}>
                    <BarChart4 className="mr-2 h-4 w-4" />
                    Ver estadísticas de expedientes
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Calendario de actividades</CardTitle>
                  <CardDescription>Visualización de tareas y actividades en calendario.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" onClick={() => router.push("/calendario")}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Ver calendario
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
