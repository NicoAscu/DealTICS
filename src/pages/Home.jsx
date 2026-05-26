import { useNavigate } from "react-router-dom"

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <h1 className="text-5xl font-bold text-gray-900 mb-4">DealTICS</h1>
      <p className="text-xl text-gray-500 text-center max-w-xl mb-8">
        Analizá la viabilidad de abrir tu negocio en cualquier zona. 
        Datos reales, decisiones inteligentes.
      </p>
      <button
        onClick={() => navigate("/map")}
        className="bg-black text-white px-8 py-3 rounded-xl text-lg hover:bg-gray-800 transition"
      >
        Analizar una zona
      </button>
    </div>
  )
}