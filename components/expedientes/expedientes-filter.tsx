"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Search, X } from "lucide-react"

export function ExpedientesFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  // Estados para los filtros
  const [numero, setNumero] = useState(searchParams.get("numero") || "")
  const [persona, setPersona] = useState(searchParams.get("persona") || "all")
  const [estado, setEstado] = useState(searchParams.get("estado") || "all")
  const [tipo, setTipo] = useState(searchParams.get("tipo") || "activos")
  const [ordenarPor, setOrdenarPor] = useState(searchParams.get("ordenarPor") || "fecha_inicio")
  const [ordenAscendente, setOrdenAscendente] = useState(searchParams.get("ordenAscendente") === "true")

  // Estados para las opciones de los selects
  const [personas, setPersonas] = useState<{ id: string; nombre: string }[]>([])
  const [estados, setEstados] = useState<{ id: number; nombre: string }[]>([])
  const [loading, setLoading] = useState(true)

  // Cargar opciones para los selects
  useEffect(() => {
    async function cargarOpciones() {
      setLoading(true)
      try {
        // Cargar personas
        const { data: personasData, error: personasError } = await supabase
          .from("personas")
          .select("id, nombre")
          .order("nombre")

        if (personasError) throw personasError
        setPersonas(personasData || [])

        // Cargar estados
        const { data: estadosData, error: estadosError } = await supabase
          .from("estados_expediente")
          .select("id, nombre")
          .order("nombre")

        if (estadosError) throw estadosError
        setEstados(estadosData || [])
      } catch (error) {
        console.error("Error al cargar opciones:", error)
      } finally {
        setLoading(false)
      }
    }

    cargarOpciones()
  }, [supabase])

  // Función para aplicar los filtros
  const aplicarFiltros = () => {
    const params = new URLSearchParams()

    if (numero) params.set("numero", numero)
    if (persona !== "all") params.set("persona", persona)
    if (estado !== "all") params.set("estado", estado)
    if (tipo !== "todos") params.set("tipo", tipo)
    if (ordenarPor) params.set("ordenarPor", ordenarPor)
    params.set("ordenAscendente", ordenAscendente.toString())

    router.push(`/expedientes?${params.toString()}`)
  }

  // Función para limpiar los filtros
  const limpiarFiltros = () => {
    setNumero("")
    setPersona("all")
    setEstado("all")
    setTipo("activos")
    setOrdenarPor("fecha_inicio")
    setOrdenAscendente(false)
    router.push("/expedientes")
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* Filtro por número */}
          <div className="space-y-2">
            <Label htmlFor="numero">Número de expediente</Label>
            <Input
              id="numero"
              placeholder="Buscar por número"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
            />
          </div>

          {/* Filtro por persona */}
          <div className="space-y-2">
            <Label htmlFor="persona">Cliente</Label>
            <Select value={persona} onValueChange={setPersona}>
              <SelectTrigger id="persona">
                <SelectValue placeholder="Seleccionar cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los clientes</SelectItem>
                {personas.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por estado */}
          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Select value={estado} onValueChange={setEstado}>
              <SelectTrigger id="estado">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {estados.map((e) => (
                  <SelectItem key={e.id} value={e.id.toString()}>
                    {e.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por tipo */}
          <div className="space-y-2">
            <Label htmlFor="tipo">Mostrar</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger id="tipo">
                <SelectValue placeholder="Tipo de expedientes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activos">Expedientes activos</SelectItem>
                <SelectItem value="archivados">Expedientes archivados</SelectItem>
                <SelectItem value="todos">Todos los expedientes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ordenar por */}
          <div className="space-y-2">
            <Label htmlFor="ordenarPor">Ordenar por</Label>
            <Select value={ordenarPor} onValueChange={setOrdenarPor}>
              <SelectTrigger id="ordenarPor">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fecha_inicio">Fecha de inicio</SelectItem>
                <SelectItem value="numero">Número de expediente</SelectItem>
                <SelectItem value="monto_total">Monto total</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orden ascendente/descendente */}
          <div className="space-y-2">
            <Label htmlFor="orden">Orden</Label>
            <Select value={ordenAscendente.toString()} onValueChange={(value) => setOrdenAscendente(value === "true")}>
              <SelectTrigger id="orden">
                <SelectValue placeholder="Orden" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">Descendente (más reciente primero)</SelectItem>
                <SelectItem value="true">Ascendente (más antiguo primero)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={limpiarFiltros} type="button">
            <X className="mr-2 h-4 w-4" />
            Limpiar filtros
          </Button>
          <Button onClick={aplicarFiltros} type="button">
            <Search className="mr-2 h-4 w-4" />
            Buscar expedientes
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
