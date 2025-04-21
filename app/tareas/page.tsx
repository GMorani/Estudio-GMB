"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, CheckSquare, Clock, Calendar } from "lucide-react"
import { ExpedientesTareasPendientes } from "@/components/tareas/expedientes-tareas-pendientes"

export default function TareasPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("pendientes")

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tareas</h1>
          <p className="text-muted-foreground">Gestiona las tareas de todos los expedientes</p>
        </div>
        <Button onClick={() => router.push("/tareas/nueva")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nueva Tarea
        </Button>
      </div>

      <Tabs defaultValue="pendientes" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pendientes">
            <CheckSquare className="mr-2 h-4 w-4" />
            Pendientes
          </TabsTrigger>
          <TabsTrigger value="vencidas">
            <Clock className="mr-2 h-4 w-4" />
            Vencidas
          </TabsTrigger>
          <TabsTrigger value="calendario">
            <Calendar className="mr-2 h-4 w-4" />
            Calendario
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pendientes" className="mt-4">
          <ExpedientesTareasPendientes vencidas={false} />
        </TabsContent>

        <TabsContent value="vencidas" className="mt-4">
          <ExpedientesTareasPendientes vencidas={true} />
        </TabsContent>

        <TabsContent value="calendario" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendario de tareas</CardTitle>
              <CardDescription>Visualiza las tareas en un calendario</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Funcionalidad en desarrollo</h3>
                <p className="text-muted-foreground">
                  La visualización de tareas en calendario estará disponible próximamente.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
