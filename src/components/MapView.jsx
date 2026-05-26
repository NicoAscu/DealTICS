import { MapContainer, TileLayer, useMapEvents, Marker } from "react-leaflet"
import { useState } from "react"
import "leaflet/dist/leaflet.css"

function LocationPicker({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng)
    }
  })
  return null
}

export default function MapView() {
  const [selected, setSelected] = useState(null)

  return (
    <div>
      <MapContainer center={[-34.6037, -58.3816]} zoom={13} style={{ height: "500px" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationPicker onSelect={setSelected} />
        {selected && <Marker position={selected} />}
      </MapContainer>
      {selected && (
        <p className="mt-2 text-sm text-gray-600">
          Zona seleccionada: {selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}
        </p>
      )}
    </div>
  )
}