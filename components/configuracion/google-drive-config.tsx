"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { verificarConexionGoogleDrive } from "@/app/configuracion/actions"
import { ChromeIcon as Google } from "lucide-react"

export default function GoogleDriveConfig() {
  const [verificando, setVerificando] = useState(false)
  const [conectado, setConectado] = useState<boolean | null>(null)
  const { toast } = useToast()

  const verificarConexion = async () => {
    setVerificando(true)
    try {
      const resultado = await verificarConexionGoogleDrive()
      setConectado(resultado.conectado)

      if (resultado.conectado) {
        toast({
          title: "Conexión verificada",
          description: "Tu cuenta está correctamente conectada a Google Drive",
        })
      } else {
        toast({
          title: "No conectado",
          description: "No se ha encontrado una conexión con Google Drive",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al verificar conexión:", error)
      setConectado(false)
      toast({
        title: "Error",
        description: "No se pudo verificar la conexión con Google Drive",
        variant: "destructive",
      })
    } finally {
      setVerificando(false)
    }
  }

  const conectarGoogleDrive = () => {
    window.location.href = "/api/auth/google"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Conexión con Google Drive</CardTitle>
        <CardDescription>Conecta tu cuenta de Google Drive para guardar y gestionar documentos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                conectado === null ? "bg-gray-300" : conectado ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span>{conectado === null ? "Estado desconocido" : conectado ? "Conectado" : "No conectado"}</span>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={verificarConexion} disabled={verificando}>
            {verificando ? "Verificando..." : "Verificar conexión"}
          </Button>

          <Button
            onClick={conectarGoogleDrive}
            disabled={verificando || conectado === true}
            className="flex items-center gap-2"
          >
            <Google className="h-4 w-4" />
            Conectar con Google Drive
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
