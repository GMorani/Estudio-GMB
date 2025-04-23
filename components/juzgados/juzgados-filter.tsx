"use client"

import { useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { debounce } from "@/lib/utils"

type JuzgadosFilterProps = {
  onFilterChange: (filters: JuzgadoFilters) => void
  jueces: string[]
  secretarios: string[]
  direcciones: string[]
}

export type JuzgadoFilters = {
  search: string
  juez: string
  secretario: string
  direccion: string
}

export function JuzgadosFilter({ onFilterChange, jueces, secretarios, direcciones }: JuzgadosFilterProps) {
  const [filters, setFilters] = useState<JuzgadoFilters>({
    search: "",
    juez: "",
    secretario: "",
    direccion: "",
  })

  // Debounce para evitar demasiadas actualizaciones durante la escritura
  const debouncedFilterChange = useCallback(
    debounce((newFilters: JuzgadoFilters) => {
      onFilterChange(newFilters)
    }, 300),
    [onFilterChange],
  )

  // Actualizar filtros y notificar al componente padre
  const updateFilters = (newFilters: Partial<JuzgadoFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    debouncedFilterChange(updatedFilters)
  }

  // Limpiar todos los filtros
  const clearFilters = () => {
    const emptyFilters = {
      search: "",
      juez: "",
      secretario: "",
      direccion: "",
    }
    setFilters(emptyFilters)
    onFilterChange(emptyFilters)
  }

  // Verificar si hay filtros activos
  const hasActiveFilters = filters.search || filters.juez || filters.secretario || filters.direccion

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Búsqueda por nombre */}
        <div className="flex-1 relative">
          <Label htmlFor="search" className="mb-2 block">
            Buscar juzgado
          </Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Buscar por nombre o número..."
              className="pl-9"
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
            />
            {filters.search && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-7 w-7 p-0"
                onClick={() => updateFilters({ search: "" })}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Limpiar búsqueda</span>
              </Button>
            )}
          </div>
        </div>

        {/* Filtro por juez */}
        <div className="w-full md:w-64">
          <Label htmlFor="juez-filter" className="mb-2 block">
            Juez
          </Label>
          <Select value={filters.juez} onValueChange={(value) => updateFilters({ juez: value })}>
            <SelectTrigger id="juez-filter">
              <SelectValue placeholder="Todos los jueces" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los jueces</SelectItem>
              {jueces.map((juez) => (
                <SelectItem key={juez} value={juez}>
                  {juez}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro por secretario */}
        <div className="w-full md:w-64">
          <Label htmlFor="secretario-filter" className="mb-2 block">
            Secretario
          </Label>
          <Select value={filters.secretario} onValueChange={(value) => updateFilters({ secretario: value })}>
            <SelectTrigger id="secretario-filter">
              <SelectValue placeholder="Todos los secretarios" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los secretarios</SelectItem>
              {secretarios.map((secretario) => (
                <SelectItem key={secretario} value={secretario}>
                  {secretario}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro por dirección */}
        <div className="w-full md:w-64">
          <Label htmlFor="direccion-filter" className="mb-2 block">
            Dirección
          </Label>
          <Select value={filters.direccion} onValueChange={(value) => updateFilters({ direccion: value })}>
            <SelectTrigger id="direccion-filter">
              <SelectValue placeholder="Todas las direcciones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las direcciones</SelectItem>
              {direcciones.map((direccion) => (
                <SelectItem key={direccion} value={direccion}>
                  {direccion}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filtros activos y botón para limpiar */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtros activos:</span>
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Búsqueda: {filters.search}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => updateFilters({ search: "" })}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Quitar filtro</span>
                </Button>
              </Badge>
            )}
            {filters.juez && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Juez: {filters.juez.split(",")[0]}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => updateFilters({ juez: "" })}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Quitar filtro</span>
                </Button>
              </Badge>
            )}
            {filters.secretario && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Secretario: {filters.secretario.split(",")[0]}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => updateFilters({ secretario: "" })}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Quitar filtro</span>
                </Button>
              </Badge>
            )}
            {filters.direccion && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Dirección: {filters.direccion.substring(0, 20)}...
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => updateFilters({ direccion: "" })}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Quitar filtro</span>
                </Button>
              </Badge>
            )}
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={clearFilters}>
              Limpiar todos
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
