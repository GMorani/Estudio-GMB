import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Función simple para formatear fechas
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "-"
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return dateObj.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch (error) {
    return "-"
  }
}

// Función simple para formatear DNI
export function formatDNI(dni: string | null | undefined): string {
  if (!dni) return "-"
  return dni.toString()
}

// Función simple para formatear teléfono
export function formatTelefono(telefono: string | null | undefined): string {
  if (!telefono) return "-"
  return telefono.toString()
}

// Función simple para formatear moneda
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "-"
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(amount)
}

// Agregar la función debounce si no existe
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout !== null) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(later, wait)
  }
}
