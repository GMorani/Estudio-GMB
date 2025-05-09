"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

interface CodigoPostalInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  description?: string
  label?: string
  required?: boolean
}

export function CodigoPostalInput({
  value,
  onChange,
  placeholder = "Ej: C1425DQF",
  description = "Ingrese el código postal alfanumérico",
  label = "Código Postal",
  required = false,
}: CodigoPostalInputProps) {
  const [inputValue, setInputValue] = useState(value || "")

  // Actualizar el valor interno cuando cambia el valor externo
  useEffect(() => {
    setInputValue(value || "")
  }, [value])

  // Manejar cambios en el input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)
  }

  // Formatear el código postal (opcional)
  const formatCodigoPostal = (codigo: string) => {
    // Aquí puedes implementar reglas de formateo específicas
    // Por ejemplo, convertir a mayúsculas
    return codigo.toUpperCase()
  }

  // Aplicar formato al perder el foco
  const handleBlur = () => {
    const formattedValue = formatCodigoPostal(inputValue)
    setInputValue(formattedValue)
    onChange(formattedValue)
  }

  return (
    <FormItem>
      <FormLabel>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </FormLabel>
      <FormControl>
        <Input
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full"
        />
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </FormItem>
  )
}
