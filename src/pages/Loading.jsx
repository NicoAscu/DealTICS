import { useEffect, useRef, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { crearAnalisis, guardarAnalisisActual } from "../services/analisis"
import { mensajeError } from "../services/api"

const steps = [
  { label: "Ubicación y dirección", step: "01 Ubicación" },
  { label: "Competencia (Google Places)", step: "02 Recolección" },
  { label: "Censo y poder adquisitivo", step: "03 Análisis" },
  { label: "Índice de oportunidad y riesgo", step: "04 Resultados" },
]

function detallesDe(r) {
  if (!r) return []
  return [
    r._neighborhood || r._address || "Ubicación guardada",
    `${r.competitor_count ?? 0} competidores en el radio`,
    r.motor?.zona ? `Poder ${r.motor.zona.nivelPoder} · demanda ${r.motor.zona.nivelDemanda}` : "Sin datos del censo",
    `Índice ${Math.round(Number(r.opportunity_index ?? 0))}/100`,
  ]
}

export default function Loading() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const [progress, setProgress] = useState(0)
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState("")
  const [intento, setIntento] = useState(0)
  const enCurso = useRef(false)

  // Pedido real al backend. useRef evita que StrictMode lo dispare dos veces.
  useEffect(() => {
    if (!state?.lat || !state?.businessId) { navigate("/analisis", { replace: true }); return }
    if (enCurso.current) return
    enCurso.current = true
    setError("")
    setProgress(0)

    crearAnalisis(state)
      .then(r => {
        guardarAnalisisActual(r)
        setResultado(r)
        setProgress(100)
        setTimeout(() => navigate("/resultados", { replace: true }), 900)
      })
      .catch(e => {
        console.error("Error en análisis:", e)
        setError(mensajeError(e, "No se pudo completar el análisis."))
      })
      .finally(() => { enCurso.current = false })
  }, [intento])

  // Barra de progreso: avanza sola hasta 90% mientras esperamos la respuesta
  useEffect(() => {
    if (resultado || error) return
    const interval = setInterval(() => {
      setProgress(p => (p >= 90 ? p : p + Math.max(0.3, (90 - p) / 40)))
    }, 200)
    return () => clearInterval(interval)
  }, [resultado, error])

  const currentStep = resultado ? steps.length : Math.min(steps.length - 1, Math.floor(progress / 25))
  const detalles = detallesDe(resultado)
  const pct = Math.round(progress)

  if (error) {
    return (
      <div style={{ minHeight: "calc(100vh - 56px)", background: "var(--color-bg)",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: 40, textAlign: "center" }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--color-text)", marginBottom: 8 }}>
          No pudimos completar el análisis
        </h2>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", maxWidth: 480, marginBottom: 24 }}>
          {error}
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => navigate("/analisis")} style={{
            background: "transparent", border: "1px solid var(--color-border)", borderRadius: 10,
            padding: "12px 20px", fontSize: 14, color: "var(--color-text)", cursor: "pointer"
          }}>← Volver</button>
          <button onClick={() => setIntento(i => i + 1)} style={{
            background: "var(--color-primary)", color: "var(--color-on-primary)", border: "none",
            borderRadius: 10, padding: "12px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer"
          }}>Reintentar</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "calc(100vh - 56px)", background: "var(--color-bg)",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: 40 }}>

      {/* Animación radar */}
      <div style={{ position: "relative", width: 180, height: 180,
        display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32 }}>
        {[80, 55, 30].map((r, i) => (
          <div key={i} style={{
            position: "absolute", width: r * 2, height: r * 2, borderRadius: "50%",
            border: "1px dashed var(--color-border)"
          }} />
        ))}
        <div style={{ width: 14, height: 14, borderRadius: "50%",
          background: "var(--color-primary)", zIndex: 1 }} />
        <div style={{ position: "absolute", width: 2, height: 80, background: "var(--color-accent)",
          transformOrigin: "bottom center", bottom: "50%", left: "50%",
          animation: "spin 2s linear infinite", opacity: 0.6 }} />
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <h2 style={{ fontSize: 28, fontWeight: 800, color: "var(--color-text)", marginBottom: 8 }}>
        Analizando la zona...
      </h2>
      <p style={{ fontSize: 15, color: "var(--color-text-muted)", marginBottom: 32, textAlign: "center" }}>
        Cruzando datos demográficos, económicos y de competencia en un radio de {state?.radius ?? 500} m.
        {pct < 90 ? "" : " Puede tardar hasta un minuto si el servidor estaba inactivo."}
      </p>

      {/* Barra de progreso */}
      <div style={{ width: "100%", maxWidth: 560, marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between",
          fontSize: 13, color: "var(--color-text-muted)", marginBottom: 8 }}>
          <span>Recolectando datos</span>
          <span>{pct}%</span>
        </div>
        <div style={{ height: 6, background: "var(--color-border)", borderRadius: 4 }}>
          <div style={{ height: "100%", borderRadius: 4,
            background: "var(--color-primary)", width: `${pct}%`, transition: "width 0.3s" }} />
        </div>
      </div>

      {/* Pasos */}
      <div style={{ display: "flex", alignItems: "center", gap: 0,
        width: "100%", maxWidth: 560, marginBottom: 32 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
              {i > 0 && <div style={{ flex: 1, height: 2,
                background: i <= currentStep ? "var(--color-primary)" : "var(--color-border)" }} />}
              <div style={{
                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700,
                background: i < currentStep ? "var(--color-primary)" : i === currentStep ? "var(--color-bg)" : "var(--color-bg)",
                color: i < currentStep ? "white" : "var(--color-text-muted)",
                border: i === currentStep ? "2px solid var(--color-primary)" : "2px solid var(--color-border)",
              }}>
                {i < currentStep ? "✓" : `0${i + 1}`}
              </div>
              {i < steps.length - 1 && <div style={{ flex: 1, height: 2,
                background: i < currentStep ? "var(--color-primary)" : "var(--color-border)" }} />}
            </div>
            <span style={{ fontSize: 11, color: i <= currentStep ? "var(--color-text)" : "var(--color-text-muted)",
              marginTop: 6, textAlign: "center" }}>
              {s.step.split(" ").slice(1).join(" ")}
            </span>
          </div>
        ))}
      </div>

      {/* Checklist */}
      <div style={{ width: "100%", maxWidth: 560, background: "var(--color-surface)",
        borderRadius: 14, border: "1px solid var(--color-border)", overflow: "hidden" }}>
        {steps.map((s, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: i < steps.length - 1 ? "1px solid var(--color-border)" : "none",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%",
                background: i < currentStep ? "var(--color-accent)" : "transparent",
                border: i === currentStep ? "2px solid var(--color-accent)" : "2px solid var(--color-border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, color: "white"
              }}>
                {i < currentStep ? "✓" : ""}
              </div>
              <span style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text)" }}>{s.label}</span>
            </div>
            <span style={{ fontSize: 13, color: i < currentStep ? "var(--color-accent)" : "var(--color-text-muted)" }}>
              {i < currentStep ? (detalles[i] || "✓") : "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}