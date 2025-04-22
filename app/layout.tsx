import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Estudio GMB",
  description: "Sistema de gestión para estudio jurídico",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <div className="flex min-h-screen">
          <div className="flex-1 overflow-auto">
            <main className="p-4">{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}
