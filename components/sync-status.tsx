"use client"

import { useOfflineService } from "@/lib/offline-service"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, RefreshCw, Database, AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { useState } from "react"

export function SyncStatus() {
  const { state, service } = useOfflineService()
  const [open, setOpen] = useState(false)

  if (!state) return null

  // Formatear la última sincronización
  const formattedLastSync = state.lastSyncTime
    ? formatDistanceToNow(new Date(state.lastSyncTime), { addSuffix: true, locale: es })
    : "Nunca"

  // Contar operaciones pendientes
  const pendingCount = state.pendingOperations.filter((op) => op.status === "pending").length
  const errorCount = state.pendingOperations.filter((op) => op.status === "error").length

  // Determinar el color del badge
  let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "default"

  if (!state.isOnline || state.connectionStatus === "disconnected" || state.connectionStatus === "error") {
    badgeVariant = "destructive"
  } else if (errorCount > 0) {
    badgeVariant = "destructive"
  } else if (pendingCount > 0) {
    badgeVariant = "secondary"
  }

  const badgeContent = (
    <Badge variant={badgeVariant} className="cursor-pointer">
      {!state.isOnline ? (
        <>
          <WifiOff className="h-3 w-3 mr-1" /> Offline
        </>
      ) : state.connectionStatus === "checking" ? (
        <>
          <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Verificando...
        </>
      ) : state.connectionStatus === "error" ? (
        <>
          <AlertCircle className="h-3 w-3 mr-1" /> Error de conexión
        </>
      ) : state.syncInProgress ? (
        <>
          <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Sincronizando...
        </>
      ) : errorCount > 0 ? (
        <>
          <AlertTriangle className="h-3 w-3 mr-1" /> {errorCount} error{errorCount !== 1 ? "es" : ""}
        </>
      ) : pendingCount > 0 ? (
        <>
          <Database className="h-3 w-3 mr-1" /> {pendingCount} pendiente{pendingCount !== 1 ? "s" : ""}
        </>
      ) : (
        <>
          <CheckCircle2 className="h-3 w-3 mr-1" /> Sincronizado
        </>
      )}
    </Badge>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{badgeContent}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Estado de sincronización</DialogTitle>
          <DialogDescription>Información sobre el estado de conexión y operaciones pendientes.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {state.isOnline ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="font-medium">Estado de conexión:</span>
            </div>
            <span>{state.isOnline ? "Conectado" : "Sin conexión"}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {state.connectionStatus === "connected" ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : state.connectionStatus === "checking" ? (
                <RefreshCw className="h-4 w-4 text-amber-500 animate-spin" />
              ) : state.connectionStatus === "error" ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="font-medium">Estado de Supabase:</span>
            </div>
            <span>
              {state.connectionStatus === "connected"
                ? "Conectado"
                : state.connectionStatus === "checking"
                  ? "Verificando..."
                  : state.connectionStatus === "error"
                    ? "Error"
                    : "Desconectado"}
            </span>
          </div>

          {state.connectionStatus === "error" && state.lastError && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="font-medium">Último error:</span>
              </div>
              <span className="text-sm text-red-500 max-w-[200px] truncate" title={state.lastError}>
                {state.lastError}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="font-medium">Última sincronización:</span>
            </div>
            <span>{formattedLastSync}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              <span className="font-medium">Operaciones pendientes:</span>
            </div>
            <span>{pendingCount}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Operaciones con error:</span>
            </div>
            <span>{errorCount}</span>
          </div>

          {(pendingCount > 0 || errorCount > 0) && (
            <div className="mt-4 border rounded-md p-2 max-h-40 overflow-y-auto">
              <h4 className="font-medium mb-2">Detalle de operaciones:</h4>
              <ul className="space-y-2 text-sm">
                {state.pendingOperations
                  .filter((op) => op.status === "pending" || op.status === "error")
                  .map((op) => (
                    <li key={op.id} className="flex justify-between">
                      <span>
                        {op.type === "insert" ? "Crear" : op.type === "update" ? "Actualizar" : "Eliminar"} {op.table}
                        {op.status === "error" && <span className="text-red-500 ml-2">(Error)</span>}
                      </span>
                      <span className="text-muted-foreground">{new Date(op.timestamp).toLocaleString()}</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="flex sm:justify-between">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (confirm("¿Estás seguro de que deseas eliminar todos los datos almacenados localmente?")) {
                  service.clearAllData()
                  setOpen(false)
                }
              }}
            >
              Limpiar datos
            </Button>

            {errorCount > 0 && (
              <Button
                type="button"
                variant="secondary"
                onClick={async () => {
                  await service.retryFailedOperations()
                }}
              >
                Reintentar errores
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cerrar
            </Button>
            <Button
              type="button"
              onClick={() => service.forceSyncData()}
              disabled={!state.isOnline || state.syncInProgress}
            >
              {state.syncInProgress ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sincronizar ahora
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
