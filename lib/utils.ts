import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  if (!dateString) return ""

  const date = new Date(dateString)
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(amount)
}

export function formatDNI(dni: string): string {
  if (!dni) return ""

  // Eliminar cualquier caracter que no sea número
  const cleaned = dni.replace(/\D/g, "")

  // Aplicar formato XX.XXX.XXX
  if (cleaned.length <= 2) {
    return cleaned
  } else if (cleaned.length <= 5) {
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`
  } else {
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}`
  }
}

export function formatTelefono(telefono: string): string {
  if (!telefono) return ""

  // Eliminar cualquier caracter que no sea número
  const cleaned = telefono.replace(/\D/g, "")

  // Aplicar formato XXX-XXX-XXXX
  if (cleaned.length <= 3) {
    return cleaned
  } else if (cleaned.length <= 6) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
  } else {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
  }
}
