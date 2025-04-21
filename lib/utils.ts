import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function formatDNI(dni_cuit: string | undefined | null): string {
  if (!dni_cuit) return "-"

  const cleanedInput = dni_cuit.replace(/[^0-9]/g, "")

  if (cleanedInput.length === 8) {
    return cleanedInput.replace(/(\d{2})(\d{3})(\d{3})/, "$1.$2.$3")
  } else if (cleanedInput.length === 11) {
    return cleanedInput.replace(/(\d{2})(\d{8})(\d{1})/, "$1-$2-$3")
  } else {
    return dni_cuit
  }
}

export function formatTelefono(telefono: string | undefined | null): string {
  if (!telefono) return "-"

  const cleanedInput = telefono.replace(/[^0-9]/g, "")

  if (cleanedInput.length === 10) {
    return cleanedInput.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3")
  } else if (cleanedInput.length === 11) {
    return cleanedInput.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, "$1-$2-$3-$4")
  } else {
    return telefono
  }
}

export function formatDate(dateString: string | undefined | null): string {
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

export function formatCurrency(amount: number | undefined | null): string {
  if (amount === null || amount === undefined) {
    return "-"
  }

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(amount)
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
