"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronDown, Search } from "lucide-react"

type Estado = {
  id: number
  nombre: string
  color: string
}

type Persona = {
  id: string
  nombre: string
}

interface ExpedientesFilterProps {
  estados: Estado[]
  personas: Persona[]
}

export function ExpedientesFilter({ estados, personas }: ExpedientesFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [numero, setNumero] = useState(searchParams.get("numero") || "")
  const [personaId, setPersonaId] = useState(searchParams.get("persona_id") || "")
  const [estadoId, setEstadoId] = useState(searchParams.get("estado_id") || "")
  const [filtroActivo, setFiltroActivo] = useState(searchParams.get("filtro") || "activos")

  const handleSearch = () => {
    const params = new URLSearchParams()

    if (numero) params.set("numero", numero)
    if (personaId) params.set("persona_id", personaId)
    if (estadoId) params.set("estado_id", estadoId)
    params.set("filtro", filtroActivo)

    router.push(`/expedientes?${params.toString()}`)
  }

  const handleTabChange = (value: string) => {
    setFiltroActivo(value)
    const params = new URLSearchParams(searchParams)
    params.set("filtro", value)
    router.push(`/expedientes?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ChevronDown className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Filtros de Búsqueda</h2>
            </div>
            <p className="text-sm text-muted-foreground">Buscar expedientes por diferentes criterios</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="numero" className="text-sm font-medium">
                  Número de Carpeta
                </label>
                <Input id="numero" placeholder="Ej: 0145" value={numero} onChange={(e) => setNumero(e.target.value)} />
              </div>

              <div className="space-y-2">
                <label htmlFor="persona" className="text-sm font-medium">
                  Persona
                </label>
                <Select value={personaId} onValueChange={setPersonaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Nombre de la persona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las personas</SelectItem>
                    {personas.map((persona) => (
                      <SelectItem key={persona.id} value={persona.id}>
                        {persona.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="estado" className="text-sm font-medium">
                  Estado
                </label>
                <Select value={estadoId} onValueChange={setEstadoId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    {estados.map((estado) => (
                      <SelectItem key={estado.id} value={estado.id.toString()}>
                        {estado.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSearch}>
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={filtroActivo} onValueChange={handleTabChange} className="w-full">
        <TabsList>
          <TabsTrigger value="activos">Expedientes Activos</TabsTrigger>
          <TabsTrigger value="archivados">Expedientes Archivados</TabsTrigger>
          <TabsTrigger value="todos">Todos los Expedientes</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
