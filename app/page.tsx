export default function Home() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Estudio GMB</h1>
      <p className="mt-4">Bienvenido al sistema de gestión para estudio jurídico.</p>
      <div className="mt-8">
        <a href="/dashboard" className="text-blue-500 hover:underline">
          Ir al Dashboard
        </a>
      </div>
    </div>
  )
}
