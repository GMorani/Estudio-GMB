import { Suspense } from "react"
import GoogleDriveConfig from "@/components/configuracion/google-drive-config"

function ConfiguracionSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>
  )
}

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Gestiona la configuración de tu cuenta y conexiones</p>
      </div>

      <Suspense fallback={<ConfiguracionSkeleton />}>
        <div className="grid gap-6">
          <GoogleDriveConfig />
          {/* Aquí puedes añadir más componentes de configuración */}
        </div>
      </Suspense>
    </div>
  )
}
