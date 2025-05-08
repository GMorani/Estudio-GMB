"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle, RefreshCw, AlertCircle, WifiOff } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ExpedientesFilter } from "@/components/expedientes/expedientes-filter"
import { useExpedientesOffline, type FiltrosExpediente } from "@/hooks/use-expedientes-offline"

export default function ExpedientesPage() {
  const [filtros, setFiltros] = useState<FiltrosExpediente>({
    tipo: "activos",
    ordenarPor: "fecha_inicio",
    ordenAscendente: false,
  })

  const { expedientes, loading, error, isOnline, sincronizar } = useExpedientesOffline(filtros)

  // Manejar cambios en los filtros
  const handleFilterChange = (newFiltros: FiltrosExpediente) => {
    setFiltros({ ...filtros, ...newFiltros })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Expedientes</h1>
        <Button asChild>
          <Link href="/expedientes/nuevo">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Expediente
          </Link>
        </Button>
      </div>

      {!isOnline && (
        <Alert className="bg-amber-50 border-amber-200 text-amber-800">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>Modo offline</AlertTitle>
          <AlertDescription>
            Estás trabajando en modo offline. Los cambios se sincronizarán cuando se restablezca la conexión.
          </AlertDescription>
        </Alert>
      )}

      <ExpedientesFilter onFilterChange={handleFilterChange} />

      {loading && expedientes.length === 0 ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                  <Skeleton className="h-10 w-[100px]" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <Button
              variant="link"
              className="p-0 h-auto text-destructive-foreground underline ml-2"
              onClick={sincronizar}
            >
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      ) : expedientes.length === 0 ? (
        <div className="rounded-md border p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">No hay expedientes para mostrar</h2>
          <p className="text-muted-foreground mb-4">
            No se encontraron expedientes que coincidan con los filtros aplicados.
          </p>
          <Button asChild>
            <Link href="/expedientes/nuevo">
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Expediente
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {expedientes.map((expediente) => (
            <Card key={expediente.id} className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">
                      <Link href={`/expedientes/${expediente.id}`} className="hover:underline">
                        {expediente.autos || "Expediente sin título"}
                      </Link>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Nº {expediente.numero} • Estado: {expediente.estado} •{" "}
                      {expediente.fecha_inicio ? new Date(expediente.fecha_inicio).toLocaleDateString() : "Sin fecha"}
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/expedientes/${expediente.id}`}>Ver detalles</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && expedientes.length > 0 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Mostrando {expedientes.length} expediente{expedientes.length !== 1 ? "s" : ""}
          </p>
          <Button variant="outline" size="sm" onClick={sincronizar} disabled={loading || !isOnline}>
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sincronizar
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
