"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientSupabase } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"

export default function DiagnosticoPage() {
  const [loading, setLoading] = useState(true)
  const [expedientes, setExpedientes] = useState<any[]>([])
  const [camposDisponibles, setCamposDisponibles] = useState<string[]>([])
  const [camposMonetarios, setCamposMonetarios] = useState<{ [key: string]: { ejemplos: any[]; contador: number } }>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function analizarExpedientes() {
      try {
        setLoading(true)
        const supabase = createClientSupabase()

        // Obtener una muestra de expedientes
        const { data, error } = await supabase.from("expedientes").select("*").limit(50)

        if (error) throw error

        if (!data || data.length === 0) {
          setError("No se encontraron expedientes para analizar")
          return
        }

        setExpedientes(data)

        // Analizar los campos disponibles (usando el primer expediente como referencia)
        const campos = Object.keys(data[0])
        setCamposDisponibles(campos)

        // Identificar campos que podrían contener valores monetarios
        const camposPosibles = ["capital_reclamado", "monto_reclamado", "monto", "valor", "importe", "capital"]
        const camposMonetariosEncontrados: { [key: string]: { ejemplos: any[]; contador: number } } = {}

        // También buscar cualquier campo que contenga palabras clave en su nombre
        const camposAdicionales = campos.filter(
          (campo) =>
            campo.includes("monto") ||
            campo.includes("valor") ||
            campo.includes("capital") ||
            campo.includes("importe") ||
            campo.includes("precio") ||
            campo.includes("costo") ||
            campo.includes("total"),
        )

        // Combinar los campos predefinidos con los encontrados por nombre
        const todosLosCamposPosibles = [...new Set([...camposPosibles, ...camposAdicionales])]

        // Analizar cada campo posible
        todosLosCamposPosibles.forEach((campo) => {
          if (campos.includes(campo)) {
            const ejemplos: any[] = []
            let contador = 0

            // Contar cuántos expedientes tienen este campo con valores válidos
            data.forEach((expediente) => {
              const valor = expediente[campo]
              if (valor !== null && valor !== undefined) {
                let valorNumerico: number | null = null

                if (typeof valor === "number") {
                  valorNumerico = valor
                } else if (typeof valor === "string") {
                  // Intentar convertir a número
                  const valorLimpio = valor.replace(/[^\d.,]/g, "").replace(/,/g, ".")
                  const num = Number.parseFloat(valorLimpio)
                  if (!isNaN(num)) {
                    valorNumerico = num
                  }
                }

                if (valorNumerico !== null && valorNumerico > 0) {
                  contador++
                  if (ejemplos.length < 5) {
                    ejemplos.push({
                      original: valor,
                      convertido: valorNumerico,
                    })
                  }
                }
              }
            })

            camposMonetariosEncontrados[campo] = {
              ejemplos,
              contador,
            }
          }
        })

        setCamposMonetarios(camposMonetariosEncontrados)
      } catch (err) {
        console.error("Error al analizar expedientes:", err)
        setError(`Error al analizar expedientes: ${err.message || "Error desconocido"}`)
      } finally {
        setLoading(false)
      }
    }

    analizarExpedientes()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Diagnóstico de Campos de Expedientes</h1>
        <p className="text-muted-foreground">
          Análisis de campos disponibles para el cálculo del capital total reclamado
        </p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Expedientes</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Se analizaron {expedientes.length} expedientes.</p>
              <p className="mt-2">Campos disponibles: {camposDisponibles.length}</p>
              <div className="mt-2 text-sm text-muted-foreground">{camposDisponibles.join(", ")}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Campos Monetarios Detectados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.keys(camposMonetarios).length === 0 ? (
                  <p>No se detectaron campos con valores monetarios.</p>
                ) : (
                  Object.entries(camposMonetarios)
                    .sort(([, a], [, b]) => b.contador - a.contador) // Ordenar por cantidad de valores válidos
                    .map(([campo, datos]) => (
                      <div key={campo} className="border-b pb-4">
                        <h3 className="text-lg font-medium">
                          Campo: <span className="font-bold">{campo}</span>
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {datos.contador} de {expedientes.length} expedientes tienen valores válidos (
                          {Math.round((datos.contador / expedientes.length) * 100)}%)
                        </p>

                        {datos.ejemplos.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium">Ejemplos:</p>
                            <table className="w-full mt-1 text-sm">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left py-1">Valor Original</th>
                                  <th className="text-left py-1">Valor Convertido</th>
                                </tr>
                              </thead>
                              <tbody>
                                {datos.ejemplos.map((ejemplo, idx) => (
                                  <tr key={idx} className="border-b border-gray-100">
                                    <td className="py-1">{String(ejemplo.original)}</td>
                                    <td className="py-1">{formatCurrency(ejemplo.convertido)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {datos.contador > 0 && (
                          <div className="mt-2">
                            <p className="text-sm">
                              Total estimado usando este campo:{" "}
                              <span className="font-bold">
                                {formatCurrency(
                                  expedientes.reduce((sum, exp) => {
                                    const valor = exp[campo]
                                    if (valor !== null && valor !== undefined) {
                                      let valorNumerico = 0
                                      if (typeof valor === "number") {
                                        valorNumerico = valor
                                      } else if (typeof valor === "string") {
                                        const valorLimpio = valor.replace(/[^\d.,]/g, "").replace(/,/g, ".")
                                        const num = Number.parseFloat(valorLimpio)
                                        if (!isNaN(num)) {
                                          valorNumerico = num
                                        }
                                      }
                                      if (valorNumerico > 0) {
                                        return sum + valorNumerico
                                      }
                                    }
                                    return sum
                                  }, 0),
                                )}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
