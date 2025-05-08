"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido al sistema de gestión del Estudio GMB</p>
      </div>

      <Tabs defaultValue="actividades">
        <TabsList>
          <TabsTrigger value="actividades">Actividades Recientes</TabsTrigger>
          <TabsTrigger value="tareas">Tareas Pendientes</TabsTrigger>
          <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
          <TabsTrigger value="clientes">Clientes Recientes</TabsTrigger>
        </TabsList>

        <TabsContent value="actividades" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Actividades Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <p>No hay actividades recientes para mostrar.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tareas" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Tareas Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <p>No hay tareas pendientes para mostrar.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estadisticas" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <p>No hay estadísticas para mostrar.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clientes" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Clientes Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <p>No hay clientes recientes para mostrar.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
