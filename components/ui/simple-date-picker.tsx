"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { format, isValid, parse } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

export interface SimpleDatePickerProps {
  date?: Date
  setDate: (date: Date | undefined) => void
  className?: string
  disabled?: boolean
  placeholder?: string
}

export function SimpleDatePicker({
  date,
  setDate,
  className,
  disabled,
  placeholder = "Seleccionar fecha",
}: SimpleDatePickerProps) {
  const [open, setOpen] = useState(false)
  const [day, setDay] = useState<string>("")
  const [month, setMonth] = useState<string>("")
  const [year, setYear] = useState<string>("")
  const [manualInput, setManualInput] = useState("")

  // Generar arrays para los selects
  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 61 }, (_, i) => currentYear - 30 + i)

  // Actualizar los selects cuando cambia la fecha
  useEffect(() => {
    if (date && isValid(date)) {
      setDay(date.getDate().toString())
      setMonth((date.getMonth() + 1).toString())
      setYear(date.getFullYear().toString())
    } else {
      setDay("")
      setMonth("")
      setYear("")
    }
  }, [date])

  // Actualizar la fecha cuando cambian los selects
  useEffect(() => {
    if (day && month && year) {
      const newDate = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))

      // Verificar que la fecha sea válida (por ejemplo, 31 de febrero no es válido)
      if (
        isValid(newDate) &&
        newDate.getDate() === Number.parseInt(day) &&
        newDate.getMonth() === Number.parseInt(month) - 1 &&
        newDate.getFullYear() === Number.parseInt(year)
      ) {
        setDate(newDate)
      }
    }
  }, [day, month, year, setDate])

  // Manejar la entrada manual de fecha
  const handleManualInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setManualInput(value)

    // Intentar parsear la fecha en formato DD/MM/YYYY
    if (value.length === 10) {
      try {
        const parsedDate = parse(value, "dd/MM/yyyy", new Date())
        if (isValid(parsedDate)) {
          setDate(parsedDate)
        }
      } catch (error) {
        // Ignorar errores de parseo
      }
    }
  }

  // Formatear la entrada manual mientras el usuario escribe
  const formatManualInput = (input: string) => {
    // Eliminar caracteres no numéricos
    const cleaned = input.replace(/\D/g, "")

    // Añadir barras automáticamente
    if (cleaned.length > 4) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`
    } else if (cleaned.length > 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`
    }
    return cleaned
  }

  // Limpiar la fecha
  const clearDate = () => {
    setDate(undefined)
    setDay("")
    setMonth("")
    setYear("")
    setManualInput("")
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground", className)}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "dd/MM/yyyy", { locale: es }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label htmlFor="day">Día</Label>
              <Select value={day} onValueChange={setDay}>
                <SelectTrigger id="day">
                  <SelectValue placeholder="Día" />
                </SelectTrigger>
                <SelectContent>
                  {days.map((d) => (
                    <SelectItem key={d} value={d.toString()}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="month">Mes</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger id="month">
                  <SelectValue placeholder="Mes" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m} value={m.toString()}>
                      {format(new Date(2000, m - 1, 1), "MMMM", { locale: es })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="year">Año</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger id="year">
                  <SelectValue placeholder="Año" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="manual-date">Ingresar manualmente (DD/MM/AAAA)</Label>
            <Input
              id="manual-date"
              value={manualInput}
              onChange={handleManualInputChange}
              placeholder="DD/MM/AAAA"
              maxLength={10}
            />
          </div>

          <div className="flex justify-between">
            <Button variant="outline" size="sm" onClick={clearDate}>
              Limpiar
            </Button>
            <Button size="sm" onClick={() => setOpen(false)}>
              Aplicar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
