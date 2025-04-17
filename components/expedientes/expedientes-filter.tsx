"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function ExpedientesFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  // Estados para los filtros
  const [numero, setNumero] = useState(searchParams.get("numero") || "")
  const [personaId, setPersonaId] = useState(searchParams.get("persona_id") || "")
  const [estadoId, setEstadoId] = useState(searchParams.get("estado_id") || "")

  // Estados para los datos de los filtros
  const [estados, setEstados] = useState<any[]>([])
  const [personas, setPersonas] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Cargar datos para los filtros
  useEffect(() => {
    async function loadFilterData() {
      try {
        // Obtener estados
        const { data: estadosData } = await supabase
          .from("estados_expediente")
          .select("id, nombre, color")
          .order("nombre")

        if (estadosData) {
          setEstados(estadosData)
        }

        // Obtener personas (clientes)
        const { data: personasData } = await supabase
          .from("personas")
          .select("id, nombre")
          .eq("tipo_id", 1) // Tipo cliente
          .order("nombre")

        if (personasData) {
          setPersonas(personasData)
        }
      } catch (err) {
        console.error("Error al cargar datos para filtros:", err)
      }
    }

    loadFilterData()
  }, [supabase])

  // Manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (isLoading) return
    setIsLoading(true)

    const params = new URLSearchParams()

    if (numero) params.set("numero", numero)
    if (personaId && personaId !== "all") params.set("persona_id", personaId)
    if (estadoId && estadoId !== "all") params.set("estado_id", estadoId)

    router.push(`/expedientes?${params.toString()}`)

    // Prevenir múltiples envíos
    setTimeout(() => {
      setIsLoading(false)
    }, 500)
  }

  // Limpiar filtros
  const handleReset = () => {
    setNumero("")
    setPersonaId("")
    setEstadoId("")
    router.push("/expedientes")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtrar Expedientes</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numero">Número de Expediente</Label>
              <Input
                id="numero"
                placeholder="Buscar por número..."
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="persona">Persona</Label>
              <Select value={personaId} onValueChange={setPersonaId}>
                <SelectTrigger id="persona">
                  <SelectValue placeholder="Seleccionar persona" />
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
              <Label htmlFor="estado">Estado</Label>
              <Select value={estadoId} onValueChange={setEstadoId}>
                <SelectTrigger id="estado">
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

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleReset}>
              <X className="mr-2 h-4 w-4" />
              Limpiar
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Search className="mr-2 h-4 w-4" />
              {isLoading ? "Buscando..." : "Buscar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
