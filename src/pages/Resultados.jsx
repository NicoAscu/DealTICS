import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import RiskBadge from "../components/RiskBadge"
import { DesgloseRiesgo, TendenciaConsumo, Recomendaciones } from "../components/PanelesResultados"
import { MapContainer, TileLayer, Marker, Circle } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"
import {
  leerAnalisisActual, guardarAnalisisActual, cargarAnalisis,
  competidoresPorDistancia, porcentaje,
} from "../services/analisis"

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, shadowUrl: markerShadow })

const pct = (v) => (v == null ? null : Math.round(v * 100))

export default function Resultados() {
  const navigate = useNavigate()
  const [data, setData] = useState(() => leerAnalisisActual())
  const [competencia, setCompetencia] = useState(null)

  // Si el análisis guardado no tiene datos del motor (localStorage viejo), lo pedimos de nuevo
  useEffect(() => {
    if (!data?.id || data.motor) return
    cargarAnalisis(data.id)
      .then(completo => {
        const merged = { ...completo, _mapPosition: completo._mapPosition ?? data._mapPosition }
        guardarAnalisisActual(merged)
        setData(merged)
      })
      .catch(() => {})
  }, [data?.id])

  // Competidores reales guardados por el back
  useEffect(() => {
    if (!data?.id) return
    competidoresPorDistancia(data.id, data._radius)
      .then(setCompetencia)
      .catch(() => setCompetencia(null))
  }, [data?.id])

  if (!data) {
    return (
      <div style={{ minHeight: "calc(100vh - 56px)", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 16, background: "var(--color-bg)" }}>
        <p style={{ color: "var(--color-text-muted)" }}>Todavía no hiciste ningún análisis.</p>
        <button onClick={() => navigate("/analisis")} style={{
          background: "var(--color-primary)", color: "var(--color-on-primary)", border: "none",
          borderRadius: 10, padding: "12px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer"
        }}>Hacer un análisis</button>
      </div>
    )
  }

  const motor = data.motor
  const mapPosition = data._mapPosition
  const mapRadius = data._radius
  const analisisRubro = motor?.rubro
  const alternativas = motor?.alternativas ?? []
  const scoresZona = motor?.zona
  const score = Math.round(parseFloat(data.opportunity_index ?? 0))
  const risk = data.risk_level || "medium"
  const neighborhood = data._neighborhood || motor?.zona?.descripcionZona || "Zona analizada"
  const businessName = analisisRubro?.nombre || data.business_name || "Negocio"
  const descripcion = scoresZona?.descripcionZona
    || (score >= 70 ? "La zona muestra buenas condiciones para este rubro."
      : score >= 50 ? "La zona tiene condiciones intermedias para este rubro."
      : "La zona presenta condiciones desfavorables para este rubro.")

  // Todos los indicadores en % de su máximo. null = sin dato (no inventamos 50%)
  const indicadores = [
    { label: "Demanda potencial", value: pct(scoresZona?.demandaPotencialScore) },
    { label: "Poder adquisitivo", value: pct(scoresZona?.poderAdquisitivoScore) },
    { label: "Baja competencia", value: porcentaje(data.breakdown, "competition") },
    { label: "Accesibilidad", value: porcentaje(data.breakdown, "transport") },
    { label: "Tráfico peatonal", value: porcentaje(data.breakdown, "flujo") },
  ]
  const maxGrupo = Math.max(1, ...(competencia?.grupos ?? []).map(g => g.value))

  return (
    <div className="page-enter layout-split" style={{ display: "flex", height: "calc(100vh - 56px)", background: "var(--color-bg)", overflow: "hidden" }}>

      {/* Mapa izquierda */}
      <div className="panel-mapa" style={{ flex: 1, background: "var(--color-surface)", margin: 16,
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
      <div className="panel-lateral" style={{ width: 560, minWidth: 400, overflowY: "auto", padding: "16px 16px 16px 0", height: "calc(100vh - 56px)" }}>
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
                {descripcion}
              </p>
              <div style={{ display: "flex", gap: 24 }}>
              {[
                  { label: "DEMANDA", value: scoresZona ? pct(scoresZona.demandaPotencialScore) + "%" : "s/d" },
                  { label: "COMPETENCIA", value: data?.competitor_count ?? 0 },
                  { label: "PROB. ÉXITO", value: parseFloat(data?.success_probability ?? 0).toFixed(0) + "%" },
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
                    <span style={{ fontWeight: 700 }}>{ind.value == null ? "s/d" : `${ind.value}%`}</span>
                  </div>
                  <div style={{ height: 4, background: "var(--color-border)", borderRadius: 2 }}>
                    <div style={{ height: "100%", borderRadius: 2, background: "var(--color-primary)",
                      width: `${ind.value ?? 0}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: 24 }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text)", marginBottom: 4 }}>
                Competidores por distancia
              </h4>
              <p style={{ fontSize: 12, color: "var(--color-accent)", marginBottom: 16 }}>
                {competencia
                  ? `${competencia.total} en un radio de ${mapRadius} m${competencia.ratingPromedio ? ` · rating prom. ${competencia.ratingPromedio}★` : ""}`
                  : `En un radio de ${mapRadius} m`}
              </p>
              {competencia?.total ? (
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100 }}>
                  {competencia.grupos.map((c, i) => (
                    <div key={c.label} style={{ flex: 1, height: "100%", display: "flex",
                      flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 10, color: "var(--color-text)" }}>{c.value || ""}</span>
                      <div style={{
                        width: "100%", borderRadius: "4px 4px 0 0",
                        background: i === 0 ? "var(--color-primary)" : "var(--color-border)",
                        height: `${(c.value / maxGrupo) * 70}%`, minHeight: c.value ? 4 : 0
                      }} />
                      <span style={{ fontSize: 10, color: "var(--color-text-muted)" }}>{c.label}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                  {competencia ? "No se encontraron competidores en el radio." : "Cargando competidores..."}
                </p>
              )}
            </div>
          </div>

          <DesgloseRiesgo riesgo={data.riesgo} nivel={risk} />
          <TendenciaConsumo categoria={data._businessCategory} />

          {/* Rubros recomendados */}
          <div style={{ padding: 24, display: "flex", justifyContent: "space-between",
            alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div style={{ flex: "1 1 100%" }}>
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
              <Recomendaciones analysisId={data.id} alternativas={alternativas} />
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