import { DashboardStats } from "@/components/dashboard-stats"
import { DashboardTabs } from "@/components/dashboard-tabs"
import { PlusCircle, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Panel de Control</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/expedientes/nuevo">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuevo Expediente
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/personas/nuevo">
              <UserPlus className="mr-2 h-4 w-4" />
              Nueva Persona
            </Link>
          </Button>
        </div>
      </div>

      <DashboardStats />
      <DashboardTabs />
    </div>
  )
}
