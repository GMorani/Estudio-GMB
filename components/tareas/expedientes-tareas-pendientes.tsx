"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { Eye, AlertCircle, CheckCircle } from "lucide-react"

type Tarea = {
  id: number
  descripcion: string
  fecha_vencimiento: string
  cumplida?: boolean
}

type Estado = {
  id: number
  nombre: string
  color: string
}

type Persona = {
  id: string
  nombre: string
}

type Expediente = {
  id: string
  numero: string
  autos: string
  fecha_inicio: string
  estado: Estado | null
  persona: Persona | null
  tareas: Tarea[]
  proximaTarea: Tarea | null
}

export function ExpedientesTareasPendientes({ expedientes }: { expedientes: Expediente[] }) {
  const router = useRouter()
  const [expandedExpediente, setExpandedExpediente] = useState<string | null>(null)

  // Si no hay expedientes con tareas pendientes, mostrar mensaje
  if (expedientes.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <div className="rounded-full bg-primary/10 p-3 mb-4">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-medium mb-2">No hay tareas pendientes</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Todos los expedientes tienen sus tareas completadas. Puedes agregar nuevas tareas desde cada expediente.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expedientes con tareas pendientes</CardTitle>
        <CardDescription>Ordenados por fecha de vencimiento más próxima</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Expediente</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Próxima tarea</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expedientes.map((expediente) => {
              // Verificar si hay una próxima tarea
              if (!expediente.proximaTarea) return null

              // Calcular si la tarea está vencida
              const fechaVencimiento = new Date(expediente.proximaTarea.fecha_vencimiento)
              const hoy = new Date()
              const vencida = fechaVencimiento < hoy

              return (
                <TableRow key={expediente.id} className="group">
                  <TableCell>
                    <div className="font-medium">{expediente.numero}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">{expediente.autos}</div>
                  </TableCell>
                  <TableCell>
                    {expediente.persona ? (
                      <div>{expediente.persona.nombre}</div>
                    ) : (
                      <div className="text-muted-foreground italic">Sin cliente</div>
                    )}
                  </TableCell>
                  <TableCell>
                    {expediente.estado ? (
                      <Badge
                        style={{
                          backgroundColor: expediente.estado.color || "#888888",
                          color: "#ffffff",
                        }}
                      >
                        {expediente.estado.nombre}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Sin estado</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[250px] truncate">{expediente.proximaTarea.descripcion}</div>
                    {vencida && (
                      <div className="flex items-center text-xs text-destructive mt-1">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Vencida
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className={`${vencida ? "text-destructive font-medium" : ""}`}>
                      {formatDate(expediente.proximaTarea.fecha_vencimiento)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="default" size="sm" onClick={() => router.push(`/expedientes/${expediente.id}`)}>
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
