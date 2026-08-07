import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { MapContainer, TileLayer, useMapEvents, Marker, Circle } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import api from "../services/api"

function LocationPicker({ onSelect }) {
  useMapEvents({ click(e) { onSelect(e.latlng) } })
  return null
}

export default function Analisis() {
  const navigate = useNavigate()
  const [position, setPosition] = useState(null)
  const [radius, setRadius] = useState(500)
  const [businesses, setBusinesses] = useState([])
  const [selectedBusiness, setSelectedBusiness] = useState("")
  const [inversion, setInversion] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get("/businesses")
      .then(r => setBusinesses(r.data))
      .catch(() => setBusinesses([
        { id: 1, name: "Panadería", category: "Gastronomía" },
        { id: 2, name: "Kiosco", category: "Retail" },
        { id: 3, name: "Cafetería", category: "Gastronomía" },
      ]))
  }, [])

  const handleAnalizar = async () => {
    if (!position || !selectedBusiness) return
    setLoading(true)
    try {
      const locRes = await api.post("/locations", {
        user_id: 1,
        latitude: position.lat,
        longitude: position.lng,
        radius_m: radius,
      })
      const locationId = locRes.data.id

      const anaRes = await api.post("/analyses", {
        user_id: 1,
        location_id: locationId,
        business_id: parseInt(selectedBusiness),
      })

      localStorage.setItem("analysisResult", JSON.stringify(anaRes.data))
      navigate("/loading")
    } catch (e) {
      navigate("/loading")
    }
  }

  const panelStyle = {
    width: 380, minWidth: 320, background: "var(--color-surface)",
    borderRadius: 16, padding: 28, margin: 16,
    border: "1px solid var(--color-border)",
    display: "flex", flexDirection: "column", gap: 20,
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    height: "calc(100vh - 88px)", overflowY: "auto", flexShrink: 0
  }

  const labelStyle = {
    fontSize: 10, fontWeight: 700, letterSpacing: 1,
    color: "var(--color-text-muted)", marginBottom: 8, display: "block"
  }

  const inputStyle = {
    width: "100%", padding: "12px 16px", borderRadius: 10,
    border: "1px solid var(--color-border)", background: "var(--color-bg)",
    color: "var(--color-text)", fontSize: 14, outline: "none"
  }

  return (
    <div style={{ display: "flex", height: "calc(100vh - 56px)", overflow: "hidden", position: "relative" }}>
      {/* Panel izquierdo */}
      <div style={panelStyle}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--color-text)", marginBottom: 4 }}>
            Configurá tu análisis
          </h2>
          <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
            Definí ubicación, radio y rubro para empezar.
          </p>
        </div>

        <div>
          <label style={labelStyle}>UBICACIÓN</label>
          <div style={{ ...inputStyle, display: "flex", justifyContent: "space-between",
            alignItems: "center", cursor: "default" }}>
            <span style={{ color: position ? "var(--color-text)" : "var(--color-text-muted)" }}>
              {position ? `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}` : "Hacé clic en el mapa"}
            </span>
            <span style={{ color: "var(--color-accent)" }}>◎</span>
          </div>
        </div>

        <div>
          <label style={labelStyle}>RADIO DE ANÁLISIS</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[500, 1000].map(r => (
              <button key={r} onClick={() => setRadius(r)} style={{
                padding: "10px", borderRadius: 10, fontSize: 14, fontWeight: 600,
                cursor: "pointer", border: "1px solid var(--color-border)",
                background: radius === r ? "var(--color-primary)" : "var(--color-bg)",
                color: radius === r ? "white" : "var(--color-text)",
              }}>{r === 500 ? "500 m" : "1 km"}</button>
            ))}
          </div>
        </div>

        <div>
          <label style={labelStyle}>RUBRO DEL NEGOCIO</label>
          <select value={selectedBusiness} onChange={e => setSelectedBusiness(e.target.value)}
            style={{ ...inputStyle, cursor: "pointer" }}>
            <option value="">Seleccioná un rubro...</option>
            {businesses.map(b => (
              <option key={b.id} value={b.id}>{b.name} · {b.category}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>INVERSIÓN ESTIMADA (OPCIONAL)</label>
          <input value={inversion} onChange={e => setInversion(e.target.value)}
            placeholder="$ 0 ARS" style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>FUENTES DE DATOS</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["Demografía", "Competencia", "Tendencias"].map(f => (
              <div key={f} style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "var(--color-bg)", border: "1px solid var(--color-border)",
                borderRadius: 20, padding: "6px 14px", fontSize: 13,
                color: "var(--color-text)"
              }}>
                <span style={{ color: "var(--color-accent)" }}>✓</span> {f}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: "auto" }}>
          <button onClick={handleAnalizar} disabled={!position || !selectedBusiness || loading}
            style={{
              width: "100%", padding: "16px", borderRadius: 12, fontSize: 15,
              fontWeight: 700, cursor: position && selectedBusiness ? "pointer" : "not-allowed",
              border: "none", background: position && selectedBusiness ? "var(--color-primary)" : "var(--color-border)",
              color: position && selectedBusiness ? "white" : "var(--color-text-muted)",
              transition: "all 0.2s"
            }}>
            {loading ? "Analizando..." : "Analizar zona"}
          </button>
          <p style={{ textAlign: "center", fontSize: 12,
            color: "var(--color-accent)", marginTop: 8 }}>
            Análisis en ~40 s · Google Places + Censo 2022
          </p>
        </div>
      </div>

      {/* Mapa */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {position && (
          <div style={{
            position: "absolute", top: 16, left: 16, zIndex: 1000,
            background: "var(--color-surface)", borderRadius: 20,
            padding: "6px 16px", fontSize: 13, color: "var(--color-text)",
            border: "1px solid var(--color-border)",
            display: "flex", alignItems: "center", gap: 8
          }}>
            <span style={{ color: "var(--color-accent)" }}>●</span>
            {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
          </div>
        )}
        <MapContainer center={[-34.6037, -58.3816]} zoom={13}
          style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationPicker onSelect={setPosition} />
          {position && (
            <>
              <Marker position={position} />
              <Circle center={position} radius={radius}
                pathOptions={{ color: "#1a2b4a", fillColor: "#1a2b4a", fillOpacity: 0.05, dashArray: "6" }} />
            </>
          )}
        </MapContainer>
      </div>
    </div>
  )
}