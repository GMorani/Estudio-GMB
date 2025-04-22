"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function SidebarTemp() {
  const pathname = usePathname()

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold">Menú</h2>
      <ul className="mt-4 space-y-2">
        <li>
          <Link href="/dashboard" className="text-blue-500 hover:underline">
            Dashboard
          </Link>
        </li>
        <li>
          <Link href="/expedientes" className="text-blue-500 hover:underline">
            Expedientes
          </Link>
        </li>
        <li>
          <Link href="/tareas" className="text-blue-500 hover:underline">
            Tareas
          </Link>
        </li>
      </ul>
    </div>
  )
}
