export default function Home() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Estudio GMB</h1>
      <p>Sistema de gestión para estudio jurídico</p>
      <ul className="mt-4 space-y-2">
        <li>
          <a href="/dashboard" className="text-blue-500 hover:underline">
            Dashboard
          </a>
        </li>
        <li>
          <a href="/expedientes" className="text-blue-500 hover:underline">
            Expedientes
          </a>
        </li>
        <li>
          <a href="/tareas" className="text-blue-500 hover:underline">
            Tareas
          </a>
        </li>
        <li>
          <a href="/clientes" className="text-blue-500 hover:underline">
            Clientes
          </a>
        </li>
        <li>
          <a href="/abogados" className="text-blue-500 hover:underline">
            Abogados
          </a>
        </li>
        <li>
          <a href="/aseguradoras" className="text-blue-500 hover:underline">
            Aseguradoras
          </a>
        </li>
        <li>
          <a href="/juzgados" className="text-blue-500 hover:underline">
            Juzgados
          </a>
        </li>
        <li>
          <a href="/peritos" className="text-blue-500 hover:underline">
            Peritos
          </a>
        </li>
        <li>
          <a href="/mediadores" className="text-blue-500 hover:underline">
            Mediadores
          </a>
        </li>
        <li>
          <a href="/calendario" className="text-blue-500 hover:underline">
            Calendario
          </a>
        </li>
        <li>
          <a href="/configuracion" className="text-blue-500 hover:underline">
            Configuración
          </a>
        </li>
      </ul>
    </div>
  )
}
