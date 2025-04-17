import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarioSemanal } from "@/components/calendario/calendario-semanal"
import { CalendarioMensual } from "@/components/calendario/calendario-mensual"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function CalendarioPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-2xl font-bold">Calendario</h1>
          <p className="text-muted-foreground">Gestiona tus tareas y eventos programados</p>
        </div>
        <Button asChild className="flex items-center gap-2">
          <Link href="/expedientes/nuevo">
            <Plus className="h-4 w-4" />
            <span>Nueva tarea</span>
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="semanal" className="flex-1 flex flex-col">
        <div className="border-b px-4">
          <TabsList>
            <TabsTrigger value="semanal">Vista Semanal</TabsTrigger>
            <TabsTrigger value="mensual">Vista Mensual</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 p-4 overflow-auto">
          <TabsContent value="semanal" className="h-full mt-0">
            <CalendarioSemanal />
          </TabsContent>
          <TabsContent value="mensual" className="h-full mt-0">
            <CalendarioMensual />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
