import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDNI(dni: string | undefined): string {
  if (!dni) return ""
  const cleanedDNI = dni.replace(/\D/g, "")

  if (cleanedDNI.length <= 2) {
    return cleanedDNI
  } else if (cleanedDNI.length <= 8) {
    return cleanedDNI.replace(/(\d{2})(\d*)/, "$1.$2")
  } else {
    return cleanedDNI.replace(/(\d{2})(\d{3})(\d{3})/, "$1.$2.$3")
  }
}

export function formatTelefono(telefono: string | undefined): string {
  if (!telefono) return ""
  const cleanedTelefono = telefono.replace(/\D/g, "")

  if (cleanedTelefono.length <= 3) {
    return cleanedTelefono
  } else if (cleanedTelefono.length <= 6) {
    return cleanedTelefono.replace(/(\d{3})(\d*)/, "$1-$2")
  } else if (cleanedTelefono.length <= 10) {
    return cleanedTelefono.replace(/(\d{3})(\d{3})(\d*)/, "$1-$2-$3")
  } else {
    return cleanedTelefono.replace(/(\d{3})(\d{4})(\d*)/, "$1-$2-$3")
  }
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return "-"

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return "-" // Invalid date
    }
    return date.toLocaleDateString("es-AR")
  } catch (error) {
    return "-" // Handle invalid date strings
  }
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) {
    return "-"
  }
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(amount)
}
