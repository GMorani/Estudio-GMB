"use client"

import { useOfflineService } from "@/lib/offline-service"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, Lock } from "lucide-react"

export function OfflineStatus() {
  const { state } = useOfflineService()

  if (!state) return null

  if (state.forcedOfflineMode) {
    return (
      <Badge variant="destructive" className="gap-1">
        <Lock className="h-3 w-3" />
        <span>Modo offline forzado</span>
      </Badge>
    )
  }

  if (!state.isOnline) {
    return (
      <Badge variant="destructive" className="gap-1">
        <WifiOff className="h-3 w-3" />
        <span>Sin conexión</span>
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="gap-1">
      <Wifi className="h-3 w-3" />
      <span>Conectado</span>
    </Badge>
  )
}
