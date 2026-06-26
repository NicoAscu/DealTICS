import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

const steps = [
  { label: "Google Places", detail: "142 locales en el radio", step: "01 Ubicación" },
  { label: "Censo demográfico 2022", detail: "1.240 hab/km²", step: "02 Recolección" },
  { label: "Google Trends", detail: "demanda de búsqueda", step: "03 Análisis" },
  { label: "Movilidad urbana", detail: "flujo peatonal estimado", step: "04 Resultados" },
]

export default function Loading() {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); navigate("/resultados"); return 100 }
        return p + 2
      })
    }, 60)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setCurrentStep(Math.floor(progress / 25))
  }, [progress])

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
        Cruzando datos demográficos, económicos y de competencia en un radio de 500 m.
      </p>

      {/* Barra de progreso */}
      <div style={{ width: "100%", maxWidth: 560, marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between",
          fontSize: 13, color: "var(--color-text-muted)", marginBottom: 8 }}>
          <span>Recolectando datos</span>
          <span>{progress}%</span>
        </div>
        <div style={{ height: 6, background: "var(--color-border)", borderRadius: 4 }}>
          <div style={{ height: "100%", borderRadius: 4,
            background: "var(--color-primary)", width: `${progress}%`, transition: "width 0.1s" }} />
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
              {i < currentStep ? s.detail : "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}