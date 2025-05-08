"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle, RefreshCw, AlertCircle, Search } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { useClientesOffline } from "@/hooks/use-clientes-offline"
import { formatDNI, formatTelefono } from "@/lib/utils"

export default function ClientesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const { clientes, loading, error, isOnline, sincronizar } = useClientesOffline(searchTerm)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <Button asChild>
          <Link href="/clientes/nuevo">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Link>
        </Button>
      </div>

      {!isOnline && (
        <Alert className="bg-amber-50 border-amber-200 text-amber-800">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Modo offline</AlertTitle>
          <AlertDescription>
            Estás trabajando en modo offline. Los cambios se sincronizarán cuando se restablezca la conexión.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nombre, DNI o email..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="ml-2" onClick={sincronizar} disabled={loading}>
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

      {loading && clientes.length === 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>DNI</TableHead>
                <TableHead className="hidden md:table-cell">Teléfono</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-[200px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-[100px]" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-5 w-[120px]" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-5 w-[150px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-9 w-[100px]" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
      ) : clientes.length === 0 ? (
        <div className="rounded-md border p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">No hay clientes para mostrar</h2>
          <p className="text-muted-foreground mb-4">
            {searchTerm
              ? "No se encontraron clientes que coincidan con la búsqueda."
              : "Comienza agregando un nuevo cliente a tu sistema."}
          </p>
          <Button asChild>
            <Link href="/clientes/nuevo">
              <PlusCircle className="mr-2 h-4 w-4" />
              Agregar Cliente
            </Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>DNI</TableHead>
                <TableHead className="hidden md:table-cell">Teléfono</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientes.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell className="font-medium">{cliente.nombre}</TableCell>
                  <TableCell>{formatDNI(cliente.dni_cuit)}</TableCell>
                  <TableCell className="hidden md:table-cell">{formatTelefono(cliente.telefono)}</TableCell>
                  <TableCell className="hidden md:table-cell">{cliente.email}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/clientes/${cliente.id}`}>Ver detalles</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {!loading && clientes.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Mostrando {clientes.length} cliente{clientes.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  )
}
