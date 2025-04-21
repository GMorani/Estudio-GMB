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
  } else if (cleanedDNI.length <= 6) {
    return `${cleanedDNI.slice(0, 2)}.${cleanedDNI.slice(2)}`
  } else {
    return `${cleanedDNI.slice(0, 2)}.${cleanedDNI.slice(2, 5)}.${cleanedDNI.slice(5)}`
  }
}

export function formatTelefono(telefono: string | undefined): string {
  if (!telefono) return ""

  const cleanedTelefono = telefono.replace(/\D/g, "")

  if (cleanedTelefono.length <= 3) {
    return cleanedTelefono
  } else if (cleanedTelefono.length <= 6) {
    return `${cleanedTelefono.slice(0, 3)}-${cleanedTelefono.slice(3)}`
  } else {
    return `${cleanedTelefono.slice(0, 3)}-${cleanedTelefono.slice(3, 6)}-${cleanedTelefono.slice(6)}`
  }
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return "-"

  try {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0") // Month is 0-indexed
    const year = date.getFullYear()

    return `${day}/${month}/${year}`
  } catch (error) {
    return "-"
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
