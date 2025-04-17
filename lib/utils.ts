import { format } from "date-fns"
import { es } from "date-fns/locale"
import { twMerge } from "tailwind-merge"
import { clsx } from "clsx"
import type { ClassValue } from "clsx"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(input: string | number | Date): string {
  const date = input instanceof Date ? input : new Date(input)
  return format(date, "dd/MM/yyyy", { locale: es })
}

export function formatDNI(dni: string): string {
  if (!dni) return ""

  const cleaned = dni.replace(/\D/g, "")

  if (cleaned.length <= 2) {
    return cleaned
  }

  if (cleaned.length <= 8) {
    return cleaned.slice(0, 2) + "." + cleaned.slice(2, 5) + "." + cleaned.slice(5, 8)
  }

  return cleaned.slice(0, 2) + "." + cleaned.slice(2, 5) + "." + cleaned.slice(5, 8) + "." + cleaned.slice(8, 9)
}

export function formatTelefono(telefono: string): string {
  if (!telefono) return ""

  const cleaned = telefono.replace(/\D/g, "")

  if (cleaned.length <= 3) {
    return cleaned
  }

  if (cleaned.length <= 6) {
    return cleaned.slice(0, 3) + "-" + cleaned.slice(3, 6)
  }

  return cleaned.slice(0, 3) + "-" + cleaned.slice(3, 6) + "-" + cleaned.slice(6, 10)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(amount)
}
