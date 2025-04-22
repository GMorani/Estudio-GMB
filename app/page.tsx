import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Estudio GMB - Sistema de Gestión",
  description: "Sistema de gestión para Estudio GMB",
}

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Bienvenido a Estudio GMB</CardTitle>
          <CardDescription>Sistema de gestión legal</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Por favor, haga clic en el botón para acceder al sistema.</p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/dashboard">Acceder al Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
