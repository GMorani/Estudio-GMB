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

// Función para crear URLs con parámetros de consulta
export function createUrl(pathname: string, params: Record<string, string | number | undefined | null>) {
  const url = new URL(pathname, window.location.origin)

  // Filtrar parámetros nulos o indefinidos
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.append(key, String(value))
    }
  })

  return url.toString()
}
