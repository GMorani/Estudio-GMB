"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Expediente = {
  id: string
  numero: string
  numero_judicial?: string
  fecha_inicio?: string
  fecha_inicio_judicial?: string
  rol: string
  expediente_estados: {
    estados_expediente: {
      nombre: string
      color: string
    }
  }[]
}

export function ClienteExpedientes({ expedientes }: { expedientes: Expediente[] }) {
  if (expedientes.length === 0) {
    return <p className="text-center text-muted-foreground py-4">No hay expedientes vinculados</p>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Expediente Judicial</TableHead>
            <TableHead>Fecha Inicio</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expedientes.map((expediente) => (
            <TableRow key={expediente.id}>
              <TableCell>
                <Link href={`/expedientes/${expediente.id}`} className="font-medium hover:underline">
                  {expediente.numero}
                </Link>
              </TableCell>
              <TableCell>{expediente.numero_judicial || "-"}</TableCell>
              <TableCell>{formatDate(expediente.fecha_inicio || "")}</TableCell>
              <TableCell>
                <Badge variant="outline">{expediente.rol}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {expediente.expediente_estados?.slice(0, 2).map((estado, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      style={{
                        backgroundColor: estado.estados_expediente.color
                          ? `${estado.estados_expediente.color}20`
                          : undefined,
                        color: estado.estados_expediente.color,
                        borderColor: estado.estados_expediente.color,
                      }}
                    >
                      {estado.estados_expediente.nombre}
                    </Badge>
                  ))}
                  {(expediente.expediente_estados?.length || 0) > 2 && (
                    <Badge variant="outline">+{(expediente.expediente_estados?.length || 0) - 2}</Badge>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
