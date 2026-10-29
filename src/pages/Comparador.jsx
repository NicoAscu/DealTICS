import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { MapContainer, TileLayer, Marker, Circle } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"
import { getUser } from "../services/api"
import ComparacionEscenarios from "../components/ComparacionEscenarios"
import { leerEscenariosLocales } from "../services/escenarios"
import { nombreAnalisis } from "../services/analisis"
import {
  leerAnalisisActual, listarHistorial, cargarAnalisis, porcentaje,
} from "../services/analisis"

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

  const motor = analisis?.motor
  const pctZona = (v) => (v == null ? 0 : Math.round(v * 100))
  const indicadores = [
    { label: "Demanda potencial", value: pctZona(motor?.zona?.demandaPotencialScore) },
    { label: "Poder adquisitivo", value: pctZona(motor?.zona?.poderAdquisitivoScore) },
    { label: "Baja competencia", value: porcentaje(analisis?.breakdown, "competition") ?? 0 },
    { label: "Accesibilidad", value: porcentaje(analisis?.breakdown, "transport") ?? 0 },
  ]

  const position = analisis?._mapPosition
  const score = parseFloat(analisis?.opportunity_index ?? 0)
      const nombre = motor?.zona?.descripcionZona || 
      (analisis?.avg_income_level === "high" ? "Zona de alto poder adquisitivo" :
       analisis?.avg_income_level === "medium" ? "Zona de poder adquisitivo medio" :
       "Zona analizada")

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
function getNombre(a) {
  const motor = a?.motor
  if (motor?.rubro?.nombre) return `${motor.rubro.nombre} · #${a.id}`
  return `Análisis #${a.id} · ${new Date(a.created_at).toLocaleDateString("es-AR")}`
}
function ComparadorZonas() {
  const navigate = useNavigate()
  const [historial, setHistorial] = useState([])
  const [escenarioA, setEscenarioA] = useState(null)
  const [escenarioB, setEscenarioB] = useState(null)
  const [seleccionando, setSeleccionando] = useState(null)
  const [loadingHistorial, setLoadingHistorial] = useState(true)

  useEffect(() => {
    // Cargar el último análisis como escenario A por defecto
    const actual = leerAnalisisActual()
    if (actual) setEscenarioA(actual)

    // Cargar historial del usuario
    const user = getUser()
    if (user?.id) {
      listarHistorial(user.id)
        .then(setHistorial)
        .catch(() => {})
        .finally(() => setLoadingHistorial(false))
    } else {
      setLoadingHistorial(false)
    }
  }, [])

  const scoreA = parseFloat(escenarioA?.opportunity_index ?? 0)
  const scoreB = parseFloat(escenarioB?.opportunity_index ?? 0)
  const diff = scoreA - scoreB

  const handleSeleccionar = async (a) => {
    let elegido = a
    try {
      elegido = await cargarAnalisis(a.id)
    } catch {
      // Sin ubicación: usamos lo que vino en el historial
    }
    if (seleccionando === "A") setEscenarioA(elegido)
    if (seleccionando === "B") setEscenarioB(elegido)
    setSeleccionando(null)
  }

  return (
    <div style={{ padding: "0 24px 24px" }}>

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
                      {getNombre(a)}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                      {new Date(a.created_at).toLocaleDateString("es-AR")} · Índice: {parseFloat(a.opportunity_index).toFixed(0)}/100 · Riesgo {a.risk_level === "low" ? "bajo" : a.risk_level === "medium" ? "medio" : "alto"}
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

      <div className="fila-comparacion" style={{ display: "flex", gap: 24, marginBottom: 24, position: "relative" }}>
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
                {diff >= 0 ? "+" : ""}{diff.toFixed(0)} pts
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

// Escenarios financieros A vs B del análisis actual (sección 8 del anteproyecto).
// Se arman en el Simulador; acá se muestran comparados.
function ComparadorEscenarios() {
  const navigate = useNavigate()
  const actual = leerAnalisisActual()
  const guardados = leerEscenariosLocales(actual?.id ?? null)

  if (!guardados?.A || !guardados?.B) {
    return (
      <div style={{ textAlign: "center", padding: 48, color: "var(--color-text-muted)" }}>
        <p style={{ marginBottom: 6, color: "var(--color-text)", fontWeight: 700 }}>
          Todavía no armaste dos escenarios financieros{actual ? ` para ${nombreAnalisis(actual)}` : ""}.
        </p>
        <p style={{ marginBottom: 16, fontSize: 13 }}>
          En el simulador cargá el escenario A, tocá “+ Comparar con B” y cambiá lo que quieras probar:
          alquiler, inversión, precio o ventas.
        </p>
        <button onClick={() => navigate("/simulador")} style={{
          background: "var(--color-primary)", color: "var(--color-on-primary)",
          border: "none", borderRadius: 8, padding: "10px 20px",
          fontSize: 14, fontWeight: 700, cursor: "pointer"
        }}>Ir al simulador</button>
      </div>
    )
  }

  return (
    <div style={{ padding: "0 24px 24px", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
        <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
          {actual ? `Análisis: ${nombreAnalisis(actual)}` : "Sin análisis de zona asociado"}
        </p>
        <button onClick={() => navigate("/simulador")} style={{
          background: "transparent", border: "1px solid var(--color-border)", borderRadius: 8,
          padding: "8px 16px", fontSize: 13, color: "var(--color-text)", cursor: "pointer"
        }}>Editar en el simulador</button>
      </div>
      <ComparacionEscenarios A={guardados.A} B={guardados.B} />
    </div>
  )
}

export default function Comparador() {
  const [vista, setVista] = useState("zonas")
  const tab = (id, label) => (
    <button type="button" onClick={() => setVista(id)} style={{
      padding: "10px 18px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer",
      border: "1px solid var(--color-border)",
      background: vista === id ? "var(--color-primary)" : "var(--color-surface)",
      color: vista === id ? "var(--color-on-primary)" : "var(--color-text)",
    }}>{label}</button>
  )
  return (
    <div className="page-enter" style={{ minHeight: "calc(100vh - 56px)", background: "var(--color-bg)" }}>
      <div style={{ display: "flex", gap: 8, padding: "24px 24px 16px", flexWrap: "wrap" }}>
        {tab("zonas", "Zonas")}
        {tab("escenarios", "Escenarios financieros")}
      </div>
      {vista === "zonas" ? <ComparadorZonas /> : <ComparadorEscenarios />}
    </div>
  )
}
