"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ExpedientesFilter() {
  const [personas, setPersonas] = useState<{ id: string; nombre: string }[]>([])
  const [estados, setEstados] = useState<{ id: string; nombre: string }[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  // Obtener parámetros de búsqueda actuales
  const numero = searchParams.get("numero") || ""
  const persona = searchParams.get("persona") || "all"
  const estado = searchParams.get("estado") || "all"
  const tipo = searchParams.get("tipo") || "activos"
  const ordenarPor = searchParams.get("ordenarPor") || "fecha_inicio"
  const ordenAscendente = searchParams.get("ordenAscendente") === "true"

  useEffect(() => {
    async function fetchOptions() {
      // Obtener personas
      const { data: personasData } = await supabase.from("personas").select("id, nombre").eq("tipo_id", 1) // Tipo cliente
      if (personasData) {
        setPersonas(personasData)
      }

      // Obtener estados
      const { data: estadosData } = await supabase.from("estados_expediente").select("id, nombre")
      if (estadosData) {
        setEstados(estadosData)
      }
    }

    fetchOptions()
  }, [supabase])

  // Actualizar la URL con los parámetros de búsqueda
  const updateURL = (newParams: { [key: string]: string }) => {
    const params = new URLSearchParams(searchParams)
    for (const key in newParams) {
      if (newParams[key]) {
        params.set(key, newParams[key])
      } else {
        params.delete(key)
      }
    }
    router.push(`/expedientes?${params.toString()}`)
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div>
        <Label htmlFor="numero">Número</Label>
        <Input
          type="text"
          id="numero"
          placeholder="Buscar por número"
          defaultValue={numero as string}
          onChange={(e) =>
            updateURL({
              numero: e.target.value,
              persona: persona,
              estado: estado,
              tipo: tipo,
              ordenarPor: ordenarPor,
              ordenAscendente: String(ordenAscendente),
            })
          }
        />
      </div>

      <div>
        <Label htmlFor="persona">Cliente</Label>
        <Select
          value={persona as string}
          onValueChange={(value) =>
            updateURL({
              persona: value,
              numero: numero,
              estado: estado,
              tipo: tipo,
              ordenarPor: ordenarPor,
              ordenAscendente: String(ordenAscendente),
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar cliente" />
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
        <Select
          value={estado as string}
          onValueChange={(value) =>
            updateURL({
              estado: value,
              persona: persona,
              numero: numero,
              tipo: tipo,
              ordenarPor: ordenarPor,
              ordenAscendente: String(ordenAscendente),
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar estado" />
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
  )
}
