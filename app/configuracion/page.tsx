import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Administra la configuración de tu sistema</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuración General</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No hay configuraciones disponibles actualmente.</p>
        </CardContent>
      </Card>
    </div>
  )
}
