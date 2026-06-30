const steps = [
    { n: "01", title: "Ubicación", desc: "Elegí un punto en el mapa y definí el radio de análisis (500m o 1km)." },
    { n: "02", title: "Datos", desc: "Seleccioná el rubro de tu negocio y, si querés, la inversión estimada." },
    { n: "03", title: "Análisis", desc: "DealTICS cruza datos de demografía, competencia y tendencias de la zona." },
    { n: "04", title: "Resultados", desc: "Recibís el índice de oportunidad, indicadores clave y recomendaciones." },
  ]
  
  export default function HowItWorksModal({ onClose }) {
    return (
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: 20
      }}>
        <div onClick={e => e.stopPropagation()} style={{
          background: "var(--color-surface)", borderRadius: 16, padding: 32,
          maxWidth: 480, width: "100%", border: "1px solid var(--color-border)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--color-text)" }}>Cómo funciona</h3>
            <button onClick={onClose} style={{
              background: "transparent", border: "none", fontSize: 20,
              color: "var(--color-text-muted)", cursor: "pointer"
            }}>✕</button>
          </div>
  
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {steps.map(s => (
              <div key={s.n} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: "var(--color-bg)", border: "1px solid var(--color-border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, color: "var(--color-accent)"
                }}>{s.n}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text)" }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 2 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
  
          <button onClick={onClose} style={{
            width: "100%", marginTop: 28, padding: "12px", borderRadius: 10,
            background: "var(--color-primary)", color: "white", border: "none",
            fontSize: 14, fontWeight: 700, cursor: "pointer"
          }}>Entendido</button>
        </div>
      </div>
    )
  }