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
import { formatDNI, formatTelefono } from "@/lib/utils"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"

type TipoPersona = {
  id: number
  nombre: string
}

type Persona = {
  id: string
  nombre: string
  dni_cuit: string
  telefono: string
  email: string
  domicilio: string
  tipo_id: number
  tipos_persona: {
    nombre: string
  }
}

export function PersonasTable({
  personas: initialPersonas,
  tiposPersona,
}: {
  personas: Persona[]
  tiposPersona: TipoPersona[]
}) {
  const [personas, setPersonas] = useState<Persona[]>(initialPersonas)
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroTipos, setFiltroTipos] = useState<number[]>([])
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  // Filtrar personas según término de búsqueda y tipos seleccionados
  const filteredPersonas = personas.filter((persona) => {
    // Filtro por término de búsqueda
    const matchesSearch =
      persona.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      persona.dni_cuit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      persona.email?.toLowerCase().includes(searchTerm.toLowerCase())

    // Filtro por tipos
    const matchesTipos =
      filtroTipos.length === 0 || // Si no hay filtros, mostrar todos
      filtroTipos.includes(persona.tipo_id)

    return matchesSearch && matchesTipos
  })

  // Eliminar persona
  async function eliminarPersona(id: string, tipo_id: number) {
    try {
      // Primero eliminar de la tabla específica según el tipo
      let tablaEspecifica = ""
      switch (tipo_id) {
        case 1:
          tablaEspecifica = "clientes"
          break
        case 2:
          tablaEspecifica = "abogados"
          break
        case 3:
          tablaEspecifica = "aseguradoras"
          break
        case 4:
          tablaEspecifica = "juzgados"
          break
        case 5:
          tablaEspecifica = "mediadores"
          break
        case 6:
          tablaEspecifica = "peritos"
          break
      }

      if (tablaEspecifica) {
        const { error: errorEspecifico } = await supabase.from(tablaEspecifica).delete().eq("id", id)
        if (errorEspecifico) throw errorEspecifico
      }

      // Luego eliminar de la tabla personas
      const { error: errorPersonas } = await supabase.from("personas").delete().eq("id", id)
      if (errorPersonas) throw errorPersonas

      // Actualizar la lista de personas
      setPersonas(personas.filter((persona) => persona.id !== id))

      toast({
        title: "Persona eliminada",
        description: "La persona ha sido eliminada correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar persona:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la persona. Puede tener expedientes asociados.",
        variant: "destructive",
      })
    }
  }

  // Obtener la ruta de edición según el tipo de persona
  const getEditRoute = (persona: Persona) => {
    switch (persona.tipo_id) {
      case 1:
        return `/clientes/${persona.id}/editar`
      case 2:
        return `/abogados/${persona.id}/editar`
      case 3:
        return `/aseguradoras/${persona.id}/editar`
      case 4:
        return `/juzgados/${persona.id}/editar`
      case 5:
        return `/mediadores/${persona.id}/editar`
      case 6:
        return `/peritos/${persona.id}/editar`
      default:
        return `/personas/${persona.id}/editar`
    }
  }

  // Obtener la ruta de detalle según el tipo de persona
  const getDetailRoute = (persona: Persona) => {
    switch (persona.tipo_id) {
      case 1:
        return `/clientes/${persona.id}`
      case 2:
        return `/abogados/${persona.id}`
      case 3:
        return `/aseguradoras/${persona.id}`
      case 4:
        return `/juzgados/${persona.id}`
      case 5:
        return `/mediadores/${persona.id}`
      case 6:
        return `/peritos/${persona.id}`
      default:
        return `/personas/${persona.id}`
    }
  }

  // Obtener color de badge según el tipo de persona
  const getTipoBadgeColor = (tipoId: number) => {
    switch (tipoId) {
      case 1: // Cliente
        return "bg-blue-100 text-blue-800 border-blue-200"
      case 2: // Abogado
        return "bg-purple-100 text-purple-800 border-purple-200"
      case 3: // Aseguradora
        return "bg-green-100 text-green-800 border-green-200"
      case 4: // Juzgado
        return "bg-amber-100 text-amber-800 border-amber-200"
      case 5: // Mediador
        return "bg-pink-100 text-pink-800 border-pink-200"
      case 6: // Perito
        return "bg-cyan-100 text-cyan-800 border-cyan-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nombre, DNI o email..."
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
              {filtroTipos.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filtroTipos.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Filtrar por tipo</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {tiposPersona.map((tipo) => (
              <DropdownMenuCheckboxItem
                key={tipo.id}
                checked={filtroTipos.includes(tipo.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFiltroTipos([...filtroTipos, tipo.id])
                  } else {
                    setFiltroTipos(filtroTipos.filter((id) => id !== tipo.id))
                  }
                }}
              >
                {tipo.nombre}
              </DropdownMenuCheckboxItem>
            ))}
            {filtroTipos.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked={false} onCheckedChange={() => setFiltroTipos([])}>
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
              <TableHead>Nombre</TableHead>
              <TableHead>DNI/CUIT</TableHead>
              <TableHead className="hidden md:table-cell">Teléfono</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPersonas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No se encontraron personas
                </TableCell>
              </TableRow>
            ) : (
              filteredPersonas.map((persona) => (
                <TableRow key={persona.id}>
                  <TableCell className="font-medium">{persona.nombre}</TableCell>
                  <TableCell>{formatDNI(persona.dni_cuit)}</TableCell>
                  <TableCell className="hidden md:table-cell">{formatTelefono(persona.telefono)}</TableCell>
                  <TableCell className="hidden md:table-cell">{persona.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getTipoBadgeColor(persona.tipo_id)}>
                      {persona.tipos_persona?.nombre || "Desconocido"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={getDetailRoute(persona)}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Ver</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={getEditRoute(persona)}>
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
                              Esta acción no se puede deshacer. Se eliminará permanentemente la persona y todas sus
                              relaciones.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => eliminarPersona(persona.id, persona.tipo_id)}
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
