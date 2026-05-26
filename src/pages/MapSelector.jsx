import MapView from "../components/MapView"

export default function MapSelector() {
  return (
    <div className="min-h-screen bg-white p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Seleccioná una zona</h2>
      <p className="text-gray-500 mb-4">Hacé clic en el mapa para elegir la ubicación que querés analizar.</p>
      <MapView />
    </div>
  )
}