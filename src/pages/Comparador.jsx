import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { MapContainer, TileLayer, Marker, Circle } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"
import api from "../services/api"

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, shadowUrl: markerShadow })

function MiniMapa({ position, radius }) {
  if (!position) return (
    <div style={{ height: 180, background: "var(--color-bg)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "var(--color-text-muted)", fontSize: 13 }}>
      Sin ubicación
    </div>
  )
  return (
    <div style={{ height: 180, position: "relative" }}>
      <MapContainer center={[position.lat, position.lng]} zoom={14}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false} dragging={false}
        scrollWheelZoom={false} doubleClickZoom={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[position.lat, position.lng]} />
        <Circle center={[position.lat, position.lng]} radius={radius || 500}
          pathOptions={{ color: "#1a2b4a", fillColor: "#1a2b4a", fillOpacity: 0.05, dashArray: "6" }} />
      </MapContainer>
    </div>
  )
}

function TarjetaEscenario({ analisis, label, recomendado, onSelect, selected }) {
  if (!analisis) return (
    <div style={{ flex: 1, background: "var(--color-surface)", borderRadius: 16,
      border: "2px dashed var(--color-border)", display: "flex",
      alignItems: "center", justifyContent: "center", minHeight: 400,
      flexDirection: "column", gap: 12, cursor: "pointer" }}
      onClick={onSelect}>
      <div style={{ fontSize: 32 }}>+</div>
      <div style={{ fontSize: 14, color: "var(--color-text-muted)" }}>
        Elegir escenario {label}
      </div>
    </div>
  )

  const motor = analisis?.motorAnalisis?.motorAnalisis
  const indicadores = [
    { label: "Demanda potencial", value: Math.round((motor?.zona?.demandaPotencialScore ?? 0.5) * 100) },
    { label: "Poder adquisitivo", value: Math.round((motor?.zona?.poderAdquisitivoScore ?? 0.5) * 100) },
    { label: "Competencia", value: analisis?.breakdown?.competition?.score ?? 0 },
    { label: "Accesibilidad", value: analisis?.breakdown?.transport?.score ?? 0 },
  ]

  const position = analisis?._mapPosition
  const score = parseFloat(analisis?.opportunity_index ?? 0)
  const nombre = motor?.zona?.descripcionZona || "Zona analizada"

  return (
    <div style={{ flex: 1, background: "var(--color-surface)", borderRadius: 16,
      border: `1px solid ${selected ? "var(--color-accent)" : "var(--color-border)"}`,
      overflow: "hidden" }}>

      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--color-border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, background: "var(--color-primary)",
              color: "var(--color-on-primary)", padding: "3px 10px", borderRadius: 6 }}>
              ESCENARIO {label}
            </span>
            {recomendado && (
              <span style={{ fontSize: 11, fontWeight: 700, border: "1px solid var(--color-border)",
                color: "var(--color-text-muted)", padding: "3px 10px", borderRadius: 6 }}>RECOMENDADO</span>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--color-text)" }}>{score.toFixed(0)}</div>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>/100 oportunidad</div>
          </div>
        </div>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-muted)" }}>
          {motor?.rubro?.nombre || "—"} · {nombre}
        </h3>
      </div>

      <MiniMapa position={position} radius={analisis?._radius} />

      <div style={{ padding: 24, borderTop: "1px solid var(--color-border)" }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text)", marginBottom: 14 }}>Indicadores</h4>
        {indicadores.map(ind => (
          <div key={ind.label} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between",
              fontSize: 12, color: "var(--color-text)", marginBottom: 4 }}>
              <span>{ind.label}</span><span style={{ fontWeight: 700 }}>{ind.value}%</span>
            </div>
            <div style={{ height: 4, background: "var(--color-border)", borderRadius: 2 }}>
              <div style={{ height: "100%", borderRadius: 2, background: "var(--color-primary)",
                width: `${ind.value}%` }} />
            </div>
          </div>
        ))}
        <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 12, lineHeight: 1.5 }}>
          {motor?.rubro?.mensajeViabilidad || "—"}
        </p>
      </div>

      <div style={{ padding: "0 24px 20px" }}>
        <button onClick={onSelect} style={{
          width: "100%", padding: "14px", borderRadius: 10, fontSize: 14, fontWeight: 700,
          cursor: "pointer", border: recomendado ? "none" : "1px solid var(--color-border)",
          background: recomendado ? "var(--color-primary)" : "transparent",
          color: recomendado ? "var(--color-on-primary)" : "var(--color-text)",
        }}>
          {selected ? "✓ Seleccionado" : `Elegir escenario ${label}`}
        </button>
      </div>
    </div>
  )
}

export default function Comparador() {
  const navigate = useNavigate()
  const [historial, setHistorial] = useState([])
  const [escenarioA, setEscenarioA] = useState(null)
  const [escenarioB, setEscenarioB] = useState(null)
  const [seleccionando, setSeleccionando] = useState(null)
  const [loadingHistorial, setLoadingHistorial] = useState(true)

  useEffect(() => {
    // Cargar el último análisis como escenario A por defecto
    const saved = localStorage.getItem("analysisResult")
    if (saved) setEscenarioA(JSON.parse(saved))

    // Cargar historial del usuario
    const userData = localStorage.getItem("user")
    if (userData) {
      const user = JSON.parse(userData)
      api.get(`/analyses/user/${user.id}`)
        .then(r => setHistorial(r.data))
        .catch(() => {})
        .finally(() => setLoadingHistorial(false))
    } else {
      setLoadingHistorial(false)
    }
  }, [])

  const scoreA = parseFloat(escenarioA?.opportunity_index ?? 0)
  const scoreB = parseFloat(escenarioB?.opportunity_index ?? 0)
  const diff = scoreA - scoreB

  const handleSeleccionar = (analisis) => {
    if (seleccionando === "A") setEscenarioA(analisis)
    if (seleccionando === "B") setEscenarioB(analisis)
    setSeleccionando(null)
  }

  return (
    <div style={{ minHeight: "calc(100vh - 56px)", background: "var(--color-bg)", padding: 24 }}>

      {/* Modal de selección */}
      {seleccionando && (
        <div onClick={() => setSeleccionando(null)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: 20
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "var(--color-surface)", borderRadius: 16, padding: 28,
            maxWidth: 480, width: "100%", border: "1px solid var(--color-border)"
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text)", marginBottom: 16 }}>
              Elegir escenario {seleccionando}
            </h3>
            {loadingHistorial ? (
              <p style={{ color: "var(--color-text-muted)" }}>Cargando análisis...</p>
            ) : historial.length === 0 ? (
              <div style={{ textAlign: "center", padding: 20 }}>
                <p style={{ color: "var(--color-text-muted)", marginBottom: 16 }}>
                  No tenés análisis guardados todavía.
                </p>
                <button onClick={() => navigate("/analisis")} style={{
                  background: "var(--color-primary)", color: "var(--color-on-primary)",
                  border: "none", borderRadius: 8, padding: "10px 20px",
                  fontSize: 14, fontWeight: 700, cursor: "pointer"
                }}>Hacer un análisis</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 400, overflowY: "auto" }}>
                {historial.map(a => (
                  <div key={a.id} onClick={() => handleSeleccionar(a)}
                    style={{ padding: "14px 16px", borderRadius: 10,
                      border: "1px solid var(--color-border)", cursor: "pointer",
                      background: "var(--color-bg)",
                      display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)" }}>
                        Análisis #{a.id}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                        {new Date(a.created_at).toLocaleDateString()} · Índice: {parseFloat(a.opportunity_index).toFixed(0)}/100
                      </div>
                    </div>
                    <span style={{ fontSize: 18, color: "var(--color-text-muted)" }}>→</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 24, marginBottom: 24, position: "relative" }}>
        <TarjetaEscenario
          analisis={escenarioA} label="A"
          recomendado={escenarioA && escenarioB && scoreA > scoreB}
          onSelect={() => setSeleccionando("A")}
          selected={!!escenarioA}
        />
        <div style={{
          position: "absolute", left: "50%", top: 80, transform: "translateX(-50%)",
          width: 36, height: 36, borderRadius: "50%", background: "var(--color-primary)",
          color: "var(--color-on-primary)", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 12, fontWeight: 700, zIndex: 2
        }}>VS</div>
        <TarjetaEscenario
          analisis={escenarioB} label="B"
          recomendado={escenarioA && escenarioB && scoreB > scoreA}
          onSelect={() => setSeleccionando("B")}
          selected={!!escenarioB}
        />
      </div>

      {escenarioA && escenarioB && (
        <div style={{ background: "var(--color-surface)", borderRadius: 16,
          border: "1px solid var(--color-border)", padding: "20px 28px",
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", letterSpacing: 1 }}>VEREDICTO</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text)" }}>
              {scoreA > scoreB
                ? "Escenario A supera a B en oportunidad comercial"
                : scoreB > scoreA
                ? "Escenario B supera a A en oportunidad comercial"
                : "Ambos escenarios tienen la misma oportunidad"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 800,
                color: diff >= 0 ? "#22c55e" : "#ef4444" }}>
                {diff >= 0 ? "+" : ""}{diff.toFixed(0)}%
              </div>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>oportunidad</div>
            </div>
            <button onClick={() => navigate("/reportes")} style={{
              background: "var(--color-primary)", color: "var(--color-on-primary)", border: "none",
              borderRadius: 10, padding: "14px 24px", fontSize: 14,
              fontWeight: 700, cursor: "pointer"
            }}>Generar reporte</button>
          </div>
        </div>
      )}

      {!escenarioA && !escenarioB && (
        <div style={{ textAlign: "center", padding: 40, color: "var(--color-text-muted)" }}>
          <p style={{ marginBottom: 16 }}>Seleccioná dos análisis para comparar.</p>
          <button onClick={() => navigate("/analisis")} style={{
            background: "var(--color-primary)", color: "var(--color-on-primary)",
            border: "none", borderRadius: 8, padding: "10px 20px",
            fontSize: 14, fontWeight: 700, cursor: "pointer"
          }}>Hacer un análisis</button>
        </div>
      )}
    </div>
  )
}