import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CalendarioPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Calendario</h1>
        <p className="text-muted-foreground">Gestiona tus tareas y eventos programados</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calendario</CardTitle>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center">
          <p className="text-muted-foreground">No hay eventos para mostrar en el calendario.</p>
        </CardContent>
      </Card>
    </div>
  )
}
