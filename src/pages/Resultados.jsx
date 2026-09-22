import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import RiskBadge from "../components/RiskBadge"
import api from "../services/api"
import { MapContainer, TileLayer, Marker, Circle } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, shadowUrl: markerShadow })

const rubrosRecomendadosFallback = ["Cafetería de especialidad", "Brunch", "Panadería boutique", "Heladería"]

const competidores = [
  { label: "Café", value: 80 },
  { label: "Resto", value: 65 },
  { label: "Kiosco", value: 50 },
  { label: "Retail", value: 40 },
  { label: "Otros", value: 30 },
]

export default function Resultados() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [analisisRubro, setAnalisisRubro] = useState(null)
  const [alternativas, setAlternativas] = useState([])
  const [scoresZona, setScoresZona] = useState(null)
  const [competidoresReales, setCompetidoresReales] = useState([])
  const [mapPosition, setMapPosition] = useState(null)
  const [mapRadius, setMapRadius] = useState(500)

  useEffect(() => {
    const saved = localStorage.getItem("analysisResult")
    if (saved) {
      const parsed = JSON.parse(saved)
      setData(parsed)
      if (parsed?._mapPosition) setMapPosition(parsed._mapPosition)
      if (parsed?._radius) setMapRadius(parsed._radius)

      const motor = parsed?.motorAnalisis?.motorAnalisis
      if (motor) {
        if (motor.rubro)        setAnalisisRubro(motor.rubro)
        if (motor.alternativas) setAlternativas(motor.alternativas)
        if (motor.zona)         setScoresZona(motor.zona)
      }

      if (parsed?.id) {
        api.get(`/analyses/${parsed.id}`)
          .then(r => {})
          .catch(() => {})
      }
    }
  }, [])

  const score = data?.opportunity_index ?? 0
  const risk = data?.risk_level || "medium"
  const neighborhood = data?.neighborhood || data?.location?.neighborhood || "—"
  const businessName = data?.business_name || data?.business?.name || "—"

  const indicadores = [
    { label: "Demanda potencial", value: data?.breakdown?.competition?.score ?? 82 },
    { label: "Poder adquisitivo", value: Math.round((data?.breakdown?.poder_adq?.raw ?? 0.67) * 100) },
    { label: "Competencia", value: data?.breakdown?.competition?.score ?? 45 },
    { label: "Accesibilidad", value: data?.breakdown?.transport?.score ?? 90 },
    { label: "Tráfico peatonal", value: data?.breakdown?.flujo?.score ?? 74 },
  ]

  return (
    <div className="page-enter" style={{ display: "flex", height: "calc(100vh - 56px)", background: "var(--color-bg)", overflow: "hidden" }}>

      {/* Mapa izquierda */}
      <div style={{ flex: 1, background: "var(--color-surface)", margin: 16,
        borderRadius: 16, border: "1px solid var(--color-border)",
        display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)",
          display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--color-text-muted)" }}>
          <span style={{ color: "var(--color-accent)" }}>●</span>
          {neighborhood} · radio {mapRadius}m
        </div>
        <div style={{ flex: 1, position: "relative" }}>
          {mapPosition ? (
            <MapContainer
              center={[mapPosition.lat, mapPosition.lng]}
              zoom={15}
              style={{ height: "100%", width: "100%" }}
              zoomControl={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[mapPosition.lat, mapPosition.lng]} />
              <Circle
                center={[mapPosition.lat, mapPosition.lng]}
                radius={mapRadius}
                pathOptions={{ color: "#1a2b4a", fillColor: "#1a2b4a", fillOpacity: 0.05, dashArray: "6" }}
              />
            </MapContainer>
          ) : (
            <div style={{ height: "100%", display: "flex", alignItems: "center",
              justifyContent: "center", background: "var(--color-bg)",
              color: "var(--color-text-muted)", fontSize: 13 }}>
              Sin ubicación guardada
            </div>
          )}
        </div>
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--color-border)" }}>
          <button onClick={() => navigate("/analisis")} style={{
            background: "transparent", border: "1px solid var(--color-border)",
            borderRadius: 8, padding: "8px 16px", fontSize: 13,
            color: "var(--color-text)", cursor: "pointer"
          }}>← Editar ubicación</button>
        </div>
      </div>

      {/* Panel derecha */}
      <div style={{ width: 560, minWidth: 400, overflowY: "auto", padding: "16px 16px 16px 0", height: "calc(100vh - 56px)" }}>
        <div style={{ background: "var(--color-surface)", borderRadius: 16,
          border: "1px solid var(--color-border)", overflow: "hidden",
          display: "flex", flexDirection: "column" }}>

          {/* Header */}
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--color-border)",
            display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)",
                letterSpacing: 1, marginBottom: 4 }}>RESULTADOS DEL ANÁLISIS</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--color-text)" }}>
                {businessName} · {neighborhood}
              </h2>
            </div>
            <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>ACTUALIZADO HOY</span>
          </div>

          {/* Score */}
          <div style={{ padding: 24, borderBottom: "1px solid var(--color-border)",
            display: "flex", gap: 24, alignItems: "center" }}>
            <div style={{ position: "relative", width: 100, height: 100,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="100" height="100" style={{ position: "absolute" }}>
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-border)" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-primary)" strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 42 * score / 100} ${2 * Math.PI * 42}`}
                  strokeLinecap="round" transform="rotate(-90 50 50)" />
              </svg>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: "var(--color-text)" }}>{score}</div>
                <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>DE 100</div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--color-text)" }}>
                  {score >= 70 ? "Oportunidad alta" : score >= 50 ? "Oportunidad media" : "Oportunidad baja"}
                </h3>
                <RiskBadge level={risk} size="md" />
              </div>
              <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 16 }}>
                La zona muestra demanda sólida y competencia moderada para un negocio de ticket medio.
              </p>
              <div style={{ display: "flex", gap: 24 }}>
                {[
                  { label: "DEMANDA", value: data?.breakdown?.competition?.score || 82 },
                  { label: "COMPETENCIA", value: data?.competitor_count || 12 },
                  { label: "TICKET", value: "$8.4k" },
                ].map(m => (
                  <div key={m.label}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)",
                      letterSpacing: 1 }}>{m.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text)" }}>{m.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Indicadores + Competidores */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr",
            borderBottom: "1px solid var(--color-border)" }}>
            <div style={{ padding: 24, borderRight: "1px solid var(--color-border)" }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text)", marginBottom: 16 }}>
                Indicadores clave
              </h4>
              {indicadores.map(ind => (
                <div key={ind.label} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between",
                    fontSize: 13, color: "var(--color-text)", marginBottom: 4 }}>
                    <span>{ind.label}</span>
                    <span style={{ fontWeight: 700 }}>{ind.value}%</span>
                  </div>
                  <div style={{ height: 4, background: "var(--color-border)", borderRadius: 2 }}>
                    <div style={{ height: "100%", borderRadius: 2, background: "var(--color-primary)",
                      width: `${ind.value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: 24 }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text)", marginBottom: 4 }}>
                Competidores por rubro
              </h4>
              <p style={{ fontSize: 12, color: "var(--color-accent)", marginBottom: 16 }}>
                En un radio de 500 m
              </p>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100 }}>
                {competidores.map((c, i) => (
                  <div key={c.label} style={{ flex: 1, display: "flex",
                    flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{
                      width: "100%", borderRadius: "4px 4px 0 0",
                      background: i === 0 ? "var(--color-primary)" : "var(--color-border)",
                      height: `${c.value}%`
                    }} />
                    <span style={{ fontSize: 10, color: "var(--color-text-muted)" }}>{c.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rubros recomendados */}
          <div style={{ padding: 24, display: "flex", justifyContent: "space-between",
            alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text)", marginBottom: 12 }}>
                Rubros recomendados
              </h4>
              {scoresZona && (
                <div style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 10,
                  background: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
                  <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                    {scoresZona.descripcionZona} · Poder <strong>{scoresZona.nivelPoder}</strong> · Demanda <strong>{scoresZona.nivelDemanda}</strong>
                  </span>
                </div>
              )}
              {analisisRubro && (
                <div style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 10,
                  background: analisisRubro.viabilidad === "no_recomendado" ? "#fee2e2" : "#dcfce7",
                  border: `1px solid ${analisisRubro.viabilidad === "no_recomendado" ? "#ef4444" : "#22c55e"}` }}>
                  <div style={{ fontSize: 13, fontWeight: 700,
                    color: analisisRubro.viabilidad === "no_recomendado" ? "#991b1b" : "#166534" }}>
                    {analisisRubro.mensajeViabilidad}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 4 }}>
                    Inversión estimada: USD {analisisRubro.inversionMinUSD?.toLocaleString()} – {analisisRubro.inversionMaxUSD?.toLocaleString()}
                  </div>
                </div>
              )}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(alternativas.length > 0 ? alternativas.map(a => a.nombre) : rubrosRecomendadosFallback).map((r, i) => (
                  <span key={r} style={{
                    padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 500,
                    background: i === 0 ? "var(--color-primary)" : "transparent",
                    color: i === 0 ? "white" : "var(--color-text)",
                    border: i === 0 ? "none" : "1px solid var(--color-border)",
                    cursor: "pointer"
                  }}>{r}</span>
                ))}
              </div>
              <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 12 }}>
                Basado en demanda, competencia y poder adquisitivo de la zona.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => navigate("/simulador")} style={{
                background: "transparent", color: "var(--color-text)",
                border: "1px solid var(--color-border)",
                borderRadius: 12, padding: "14px 24px", fontSize: 14,
                fontWeight: 700, cursor: "pointer", flexShrink: 0
              }}>Simular costos</button>
              <button onClick={() => navigate("/comparador")} style={{
                background: "var(--color-primary)", color: "var(--color-on-primary)", border: "none",
                borderRadius: 12, padding: "14px 24px", fontSize: 14,
                fontWeight: 700, cursor: "pointer", flexShrink: 0
              }}>Comparar escenarios</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}