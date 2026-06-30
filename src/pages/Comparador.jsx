import { useNavigate } from "react-router-dom"

const escenarios = {
  a: {
    nombre: "Palermo, CABA", score: 78,
    indicadores: [
      { label: "Demanda potencial", value: 82 },
      { label: "Poder adquisitivo", value: 67 },
      { label: "Competencia", value: 45 },
      { label: "Accesibilidad", value: 90 },
    ],
    descripcion: "Alta demanda gastronómica y poder adquisitivo elevado. Competencia moderada y buena accesibilidad."
  },
  b: {
    nombre: "Villa Crespo, CABA", score: 64,
    indicadores: [
      { label: "Demanda potencial", value: 61 },
      { label: "Poder adquisitivo", value: 58 },
      { label: "Competencia", value: 28 },
      { label: "Accesibilidad", value: 72 },
    ],
    descripcion: "Zona en crecimiento con menor competencia, pero demanda y ticket promedio más bajos."
  }
}

function Tarjeta({ data, label, recomendado }) {
  return (
    <div style={{ flex: 1, background: "var(--color-surface)", borderRadius: 16,
      border: "1px solid var(--color-border)", overflow: "hidden" }}>

      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--color-border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, background: "var(--color-primary)",
              color: "white", padding: "3px 10px", borderRadius: 6 }}>ESCENARIO {label}</span>
            {recomendado && (
              <span style={{ fontSize: 11, fontWeight: 700, border: "1px solid var(--color-border)",
                color: "var(--color-text-muted)", padding: "3px 10px", borderRadius: 6 }}>RECOMENDADO</span>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--color-text)" }}>{data.score}</div>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>/100 oportunidad</div>
          </div>
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text)" }}>{data.nombre}</h3>
      </div>

      <div style={{ height: 180, background: "var(--color-bg)", position: "relative",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        {[60, 40, 20].map((r, i) => (
          <div key={i} style={{ position: "absolute", width: r * 2, height: r * 2,
            borderRadius: "50%", border: "1px dashed var(--color-border)" }} />
        ))}
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--color-primary)" }} />
        <div style={{ position: "absolute", bottom: 12, left: 12, fontSize: 11,
          color: "var(--color-text-muted)", background: "var(--color-surface)",
          padding: "3px 10px", borderRadius: 20, border: "1px solid var(--color-border)" }}>
          ● {data.nombre}
        </div>
      </div>

      <div style={{ padding: 24, borderTop: "1px solid var(--color-border)" }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text)", marginBottom: 14 }}>Indicadores</h4>
        {data.indicadores.map(ind => (
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
      </div>

      <div style={{ padding: "0 24px 16px" }}>
        <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.5 }}>{data.descripcion}</p>
      </div>

      <div style={{ padding: 24, paddingTop: 0 }}>
        <button style={{
          width: "100%", padding: "14px", borderRadius: 10, fontSize: 14, fontWeight: 700,
          cursor: "pointer", border: recomendado ? "none" : "1px solid var(--color-border)",
          background: recomendado ? "var(--color-primary)" : "transparent",
          color: recomendado ? "white" : "var(--color-text)",
        }}>{recomendado ? "Elegir escenario " + label : "Ver detalle " + label}</button>
      </div>
    </div>
  )
}

export default function Comparador() {
  const navigate = useNavigate()
  const diff = escenarios.a.score - escenarios.b.score

  return (
    <div style={{ minHeight: "calc(100vh - 56px)", background: "var(--color-bg)", padding: 24 }}>
      <div style={{ display: "flex", gap: 24, marginBottom: 24, position: "relative" }}>
        <Tarjeta data={escenarios.a} label="A" recomendado />
        <div style={{
          position: "absolute", left: "50%", top: 80, transform: "translateX(-50%)",
          width: 36, height: 36, borderRadius: "50%", background: "var(--color-primary)",
          color: "white", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 700, zIndex: 2
        }}>VS</div>
        <Tarjeta data={escenarios.b} label="B" />
      </div>

      <div style={{ background: "var(--color-surface)", borderRadius: 16,
        border: "1px solid var(--color-border)", padding: "20px 28px",
        display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", letterSpacing: 1 }}>VEREDICTO</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text)" }}>
            Escenario A supera a B en oportunidad comercial
          </div>
        </div>
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#22c55e" }}>+{diff}%</div>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>oportunidad</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#ef4444" }}>−22%</div>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>competencia</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#22c55e" }}>+31%</div>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>ticket medio</div>
          </div>
          <button style={{
            background: "var(--color-primary)", color: "white", border: "none",
            borderRadius: 10, padding: "14px 24px", fontSize: 14,
            fontWeight: 700, cursor: "pointer"
          }}>Generar reporte</button>
        </div>
      </div>
    </div>
  )
}