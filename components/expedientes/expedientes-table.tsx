"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, Pencil, Trash2, Search, Filter } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDate, formatCurrency } from "@/lib/utils"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"

type Estado = {
  id: number
  nombre: string
  color: string
}

type Expediente = {
  id: string
  numero: string
  numero_judicial: string | null
  fecha_inicio: string | null
  fecha_inicio_judicial: string | null
  monto_total: number | null
  juzgado_id: string | null
  expediente_estados: {
    estados_expediente: Estado
  }[]
  expediente_personas: {
    rol: string
    personas: {
      id: string
      nombre: string
    }
  }[]
}

export function ExpedientesTable({
  expedientes: initialExpedientes,
  estados,
}: {
  expedientes: Expediente[]
  estados: Estado[]
}) {
  const [expedientes, setExpedientes] = useState<Expediente[]>(initialExpedientes)
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroEstados, setFiltroEstados] = useState<number[]>([])
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  // Filtrar expedientes según término de búsqueda y estados seleccionados
  const filteredExpedientes = expedientes.filter((expediente) => {
    // Filtro por término de búsqueda
    const matchesSearch =
      expediente.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expediente.numero_judicial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expediente.expediente_personas.some((p) => p.personas.nombre.toLowerCase().includes(searchTerm.toLowerCase()))

    // Filtro por estados
    const matchesEstados =
      filtroEstados.length === 0 || // Si no hay filtros, mostrar todos
      expediente.expediente_estados.some((e) => filtroEstados.includes(e.estados_expediente.id))

    return matchesSearch && matchesEstados
  })

  // Eliminar expediente
  async function eliminarExpediente(id: string) {
    try {
      // Eliminar expediente
      const { error } = await supabase.from("expedientes").delete().eq("id", id)

      if (error) throw error

      // Actualizar la lista de expedientes
      setExpedientes(expedientes.filter((exp) => exp.id !== id))

      toast({
        title: "Expediente eliminado",
        description: "El expediente ha sido eliminado correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar expediente:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el expediente",
        variant: "destructive",
      })
    }
  }

  // Obtener actores y demandados de un expediente
  const getPersonasPorRol = (expediente: Expediente, rol: string) => {
    return expediente.expediente_personas
      .filter((p) => p.rol === rol)
      .map((p) => p.personas.nombre)
      .join(", ")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por número, expediente judicial o personas..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtrar
              {filtroEstados.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filtroEstados.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Filtrar por estado</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {estados.map((estado) => (
              <DropdownMenuCheckboxItem
                key={estado.id}
                checked={filtroEstados.includes(estado.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFiltroEstados([...filtroEstados, estado.id])
                  } else {
                    setFiltroEstados(filtroEstados.filter((id) => id !== estado.id))
                  }
                }}
              >
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: estado.color }} />
                  {estado.nombre}
                </div>
              </DropdownMenuCheckboxItem>
            ))}
            {filtroEstados.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked={false} onCheckedChange={() => setFiltroEstados([])}>
                  Limpiar filtros
                </DropdownMenuCheckboxItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Expediente Judicial</TableHead>
              <TableHead>Fecha Inicio</TableHead>
              <TableHead>Actores</TableHead>
              <TableHead>Demandados</TableHead>
              <TableHead>Estados</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExpedientes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  No se encontraron expedientes
                </TableCell>
              </TableRow>
            ) : (
              filteredExpedientes.map((expediente) => (
                <TableRow key={expediente.id}>
                  <TableCell className="font-medium">{expediente.numero}</TableCell>
                  <TableCell>{expediente.numero_judicial || "-"}</TableCell>
                  <TableCell>{formatDate(expediente.fecha_inicio || "")}</TableCell>
                  <TableCell>{getPersonasPorRol(expediente, "Actora") || "-"}</TableCell>
                  <TableCell>{getPersonasPorRol(expediente, "Demandada") || "-"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {expediente.expediente_estados.slice(0, 2).map((estado, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          style={{
                            backgroundColor: estado.estados_expediente.color
                              ? `${estado.estados_expediente.color}20`
                              : undefined,
                            color: estado.estados_expediente.color,
                            borderColor: estado.estados_expediente.color,
                          }}
                        >
                          {estado.estados_expediente.nombre}
                        </Badge>
                      ))}
                      {expediente.expediente_estados.length > 2 && (
                        <Badge variant="outline">+{expediente.expediente_estados.length - 2}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{expediente.monto_total ? formatCurrency(expediente.monto_total) : "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/expedientes/${expediente.id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Ver</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/expedientes/${expediente.id}/editar`}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará permanentemente el expediente y todas sus
                              relaciones.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => eliminarExpediente(expediente.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
