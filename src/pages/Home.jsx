import { useNavigate } from "react-router-dom"

const stats = [
  { label: "DENSIDAD", value: "1.240", unit: "hab/km²" },
  { label: "COMPETIDORES", value: "12", unit: "en 500 m" },
  { label: "TICKET MEDIO", value: "$8.4k", unit: "estimado" },
]

const steps = ["Ubicación", "Datos", "Análisis", "Resultados"]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: "calc(100vh - 56px)", background: "var(--color-bg)",
      display: "flex", alignItems: "center", padding: "0 64px", gap: 64 }}>

      {/* Izquierda */}
      <div style={{ flex: 1 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "var(--color-surface)", border: "1px solid var(--color-border)",
          borderRadius: 20, padding: "4px 14px", fontSize: 11,
          color: "var(--color-text-muted)", fontWeight: 600,
          letterSpacing: 1, marginBottom: 24
        }}>
          VIABILIDAD COMERCIAL · DATA EN MINUTOS
        </div>

        <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.15,
          color: "var(--color-text)", marginBottom: 16 }}>
          Sabé si tu negocio<br />va a funcionar<br />
          <span style={{ color: "var(--color-accent)" }}>antes de abrirlo.</span>
        </h1>

        <p style={{ fontSize: 16, color: "var(--color-text-muted)",
          maxWidth: 480, lineHeight: 1.6, marginBottom: 36 }}>
          Elegí un punto en el mapa y DealTICS analiza la demanda, la competencia
          y el entorno económico de la zona — sin estudios de USD 10.000.
        </p>

        <div style={{ display: "flex", gap: 12, marginBottom: 64 }}>
          <button onClick={() => navigate("/analisis")} style={{
            background: "var(--color-primary)", color: "white",
            border: "none", borderRadius: 10, padding: "14px 28px",
            fontSize: 15, fontWeight: 600, cursor: "pointer"
          }}>Comenzar análisis</button>
          <button style={{
            background: "transparent", color: "var(--color-text)",
            border: "1px solid var(--color-border)", borderRadius: 10,
            padding: "14px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer"
          }}>Cómo funciona</button>
        </div>

        <div style={{ display: "flex", gap: 40, borderTop: "1px solid var(--color-border)", paddingTop: 24 }}>
          {steps.map((s, i) => (
            <div key={s}>
              <div style={{ fontSize: 13, fontWeight: 700,
                color: i === 0 ? "var(--color-accent)" : "var(--color-text-muted)" }}>
                0{i + 1}
              </div>
              <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>{s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Derecha — preview */}
      <div style={{ flex: 1, background: "var(--color-surface)",
        borderRadius: 20, overflow: "hidden",
        border: "1px solid var(--color-border)", minHeight: 480 }}>

        {/* Índice */}
        <div style={{ padding: 20, borderBottom: "1px solid var(--color-border)",
          display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)",
              letterSpacing: 1, marginBottom: 4 }}>ÍNDICE DE OPORTUNIDAD</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: "var(--color-text)" }}>
              78 <span style={{ fontSize: 16, color: "var(--color-text-muted)" }}>/100</span>
            </div>
          </div>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            border: "3px solid var(--color-accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20
          }}>✓</div>
        </div>

        {/* Mapa placeholder */}
        <div style={{ height: 280, background: "var(--color-bg)",
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, display: "flex",
            alignItems: "center", justifyContent: "center" }}>
            {[120, 80, 40].map((r, i) => (
              <div key={i} style={{
                position: "absolute", width: r * 2, height: r * 2,
                borderRadius: "50%", border: "1px dashed var(--color-border)"
              }} />
            ))}
            <div style={{
              width: 12, height: 12, borderRadius: "50%",
              background: "var(--color-primary)", zIndex: 1
            }} />
          </div>
          <div style={{ position: "absolute", top: 8, right: 8, fontSize: 11,
            color: "var(--color-text-muted)", background: "var(--color-surface)",
            padding: "2px 8px", borderRadius: 20 }}>● BAJO</div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          borderTop: "1px solid var(--color-border)" }}>
          {stats.map((s, i) => (
            <div key={s.label} style={{
              padding: "16px 20px",
              borderRight: i < 2 ? "1px solid var(--color-border)" : "none"
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)",
                letterSpacing: 1, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-text)" }}>
                {s.value} <span style={{ fontSize: 11, fontWeight: 400,
                  color: "var(--color-text-muted)" }}>{s.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}