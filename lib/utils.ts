import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea una fecha en formato legible
 * @param date Fecha a formatear (string, Date o null)
 * @param options Opciones de formato
 * @returns Fecha formateada como string
 */
export function formatDate(date: string | Date | null | undefined, options: Intl.DateTimeFormatOptions = {}): string {
  if (!date) return "No disponible"

  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...options,
  }

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return new Intl.DateTimeFormat("es-AR", defaultOptions).format(dateObj)
  } catch (error) {
    console.error("Error al formatear fecha:", error)
    return "Fecha inválida"
  }
}

/**
 * Formatea un número de DNI argentino
 * @param dni Número de DNI a formatear
 * @returns DNI formateado (ej: 12.345.678)
 */
export function formatDNI(dni: string | null | undefined): string {
  if (!dni) return "No disponible"

  // Eliminar caracteres no numéricos
  const cleanedDNI = dni.replace(/\D/g, "")

  if (cleanedDNI.length === 0) return "DNI inválido"

  try {
    // Formato estándar para DNI argentino: XX.XXX.XXX
    if (cleanedDNI.length <= 2) {
      return cleanedDNI
    } else if (cleanedDNI.length <= 5) {
      return `${cleanedDNI.slice(0, 2)}.${cleanedDNI.slice(2)}`
    } else if (cleanedDNI.length <= 8) {
      return `${cleanedDNI.slice(0, 2)}.${cleanedDNI.slice(2, 5)}.${cleanedDNI.slice(5)}`
    } else {
      // Para CUIT/CUIL: XX-XXXXXXXX-X
      return `${cleanedDNI.slice(0, 2)}-${cleanedDNI.slice(2, 10)}-${cleanedDNI.slice(10)}`
    }
  } catch (error) {
    console.error("Error al formatear DNI:", error)
    return dni // Devolver el valor original en caso de error
  }
}

/**
 * Formatea un número de teléfono argentino
 * @param telefono Número de teléfono a formatear
 * @returns Teléfono formateado (ej: 011-1234-5678)
 */
export function formatTelefono(telefono: string | null | undefined): string {
  if (!telefono) return "No disponible"

  // Eliminar caracteres no numéricos
  const cleanedTelefono = telefono.replace(/\D/g, "")

  if (cleanedTelefono.length === 0) return "Teléfono inválido"

  try {
    // Diferentes formatos según la longitud
    if (cleanedTelefono.length <= 4) {
      return cleanedTelefono
    } else if (cleanedTelefono.length <= 8) {
      return `${cleanedTelefono.slice(0, 4)}-${cleanedTelefono.slice(4)}`
    } else if (cleanedTelefono.length <= 10) {
      return `${cleanedTelefono.slice(0, 3)}-${cleanedTelefono.slice(3, 6)}-${cleanedTelefono.slice(6)}`
    } else {
      // Para números con código de país y área
      return `${cleanedTelefono.slice(0, 3)}-${cleanedTelefono.slice(3, 7)}-${cleanedTelefono.slice(7)}`
    }
  } catch (error) {
    console.error("Error al formatear teléfono:", error)
    return telefono // Devolver el valor original en caso de error
  }
}

/**
 * Formatea un valor monetario
 * @param amount Monto a formatear
 * @param currency Moneda (por defecto ARS)
 * @returns Monto formateado como string
 */
export function formatCurrency(amount: number | string | null | undefined, currency = "ARS"): string {
  if (amount === null || amount === undefined) return "No disponible"

  const numericAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount

  if (isNaN(numericAmount)) return "Monto inválido"

  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(numericAmount)
  } catch (error) {
    console.error("Error al formatear monto:", error)
    return `${numericAmount} ${currency}`
  }
}

/**
 * Trunca un texto a una longitud máxima
 * @param text Texto a truncar
 * @param maxLength Longitud máxima
 * @returns Texto truncado con "..." si excede la longitud máxima
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return ""
  if (text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

/**
 * Genera un color aleatorio en formato hexadecimal
 * @returns Color hexadecimal
 */
export function generateRandomColor(): string {
  return `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0")}`
}

/**
 * Convierte la primera letra de cada palabra a mayúscula
 * @param text Texto a capitalizar
 * @returns Texto con la primera letra de cada palabra en mayúscula
 */
export function capitalizeWords(text: string): string {
  if (!text) return ""
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}
