"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export function ExpedientesFilter() {
  const [personas, setPersonas] = useState<{ id: string; nombre: string }[]>([])
  const [estados, setEstados] = useState<{ id: string; nombre: string }[]>([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  // Obtener parámetros de búsqueda actuales
  const numero = searchParams.get("numero") || ""
  const persona = searchParams.get("persona") || "all"
  const estado = searchParams.get("estado") || "all"
  const tipo = searchParams.get("tipo") || "activos"
  const ordenarPor = searchParams.get("ordenarPor") || "fecha_inicio"
  const ordenAscendente = searchParams.get("ordenAscendente") === "true"

  // Estado local para los filtros
  const [numeroFilter, setNumeroFilter] = useState(numero)
  const [personaFilter, setPersonaFilter] = useState(persona)
  const [estadoFilter, setEstadoFilter] = useState(estado)

  useEffect(() => {
    async function fetchOptions() {
      setLoadingOptions(true)
      try {
        // Obtener personas (clientes)
        const { data: personasData, error: personasError } = await supabase
          .from("personas")
          .select("id, nombre")
          .eq("tipo_id", 1) // Tipo cliente
          .order("nombre")

        if (personasError) throw personasError

        // Obtener estados
        const { data: estadosData, error: estadosError } = await supabase
          .from("estados_expediente")
          .select("id, nombre")
          .order("nombre")

        if (estadosError) throw estadosError

        setPersonas(personasData || [])
        setEstados(estadosData || [])
      } catch (error) {
        console.error("Error al cargar opciones de filtro:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las opciones de filtro.",
          variant: "destructive",
        })
      } finally {
        setLoadingOptions(false)
      }
    }

    fetchOptions()
  }, [supabase, toast])

  // Actualizar la URL con los parámetros de búsqueda
  const applyFilters = () => {
    const params = new URLSearchParams()

    if (numeroFilter) params.set("numero", numeroFilter)
    if (personaFilter !== "all") params.set("persona", personaFilter)
    if (estadoFilter !== "all") params.set("estado", estadoFilter)

    // Mantener los otros parámetros
    params.set("tipo", tipo)
    params.set("ordenarPor", ordenarPor)
    params.set("ordenAscendente", String(ordenAscendente))

    router.push(`/expedientes?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="numero">Número</Label>
          <Input
            type="text"
            id="numero"
            placeholder="Buscar por número"
            value={numeroFilter}
            onChange={(e) => setNumeroFilter(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="persona">Cliente</Label>
          <Select value={personaFilter} onValueChange={setPersonaFilter} disabled={loadingOptions}>
            <SelectTrigger>
              <SelectValue placeholder={loadingOptions ? "Cargando..." : "Seleccionar cliente"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {personas.map((persona) => (
                <SelectItem key={persona.id} value={persona.id}>
                  {persona.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="estado">Estado</Label>
          <Select value={estadoFilter} onValueChange={setEstadoFilter} disabled={loadingOptions}>
            <SelectTrigger>
              <SelectValue placeholder={loadingOptions ? "Cargando..." : "Seleccionar estado"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {estados.map((estado) => (
                <SelectItem key={estado.id} value={estado.id}>
                  {estado.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={applyFilters} disabled={loadingOptions}>
          {loadingOptions && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Aplicar Filtros
        </Button>
      </div>
    </div>
  )
}
