import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Reportes() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem("analysisResult")
    if (saved) setData(JSON.parse(saved))
  }, [])

  const motor = data?.motorAnalisis?.motorAnalisis
  const score = parseFloat(data?.opportunity_index ?? 0).toFixed(0)
  const risk = data?.risk_level || "—"
  const riskLabel = { low: "Bajo", medium: "Medio", high: "Alto" }[risk] || "—"
  const riskColor = { low: "#22c55e", medium: "#f59e0b", high: "#ef4444" }[risk] || "var(--color-text)"

  if (!data) return (
    <div style={{ minHeight: "calc(100vh - 56px)", background: "var(--color-bg)",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: 40 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--color-text)", marginBottom: 8 }}>
        No hay análisis para reportar
      </h2>
      <p style={{ fontSize: 14, color: "var(--color-text-muted)", marginBottom: 24 }}>
        Hacé un análisis primero para generar un reporte.
      </p>
      <button onClick={() => navigate("/analisis")} style={{
        background: "var(--color-primary)", color: "var(--color-on-primary)",
        border: "none", borderRadius: 10, padding: "12px 24px",
        fontSize: 14, fontWeight: 700, cursor: "pointer"
      }}>Ir al análisis</button>
    </div>
  )

  return (
    <div className="page-enter" style={{ minHeight: "calc(100vh - 56px)", background: "var(--color-bg)", padding: 32 }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)",
              letterSpacing: 1, marginBottom: 4 }}>REPORTE DE ANÁLISIS</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--color-text)" }}>
              {motor?.rubro?.nombre || "Negocio"} · {motor?.zona?.descripcionZona || "Zona analizada"}
            </h2>
            <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 4 }}>
              Generado el {new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })}
            </p>
          </div>
          <button onClick={() => window.print()} style={{
            background: "var(--color-primary)", color: "var(--color-on-primary)",
            border: "none", borderRadius: 10, padding: "12px 20px",
            fontSize: 14, fontWeight: 700, cursor: "pointer"
          }}>🖨 Imprimir / PDF</button>
        </div>

        {/* Score principal */}
        <div style={{ background: "var(--color-surface)", borderRadius: 16,
          border: "1px solid var(--color-border)", padding: 28, marginBottom: 16,
          display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ position: "relative", width: 90, height: 90,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="90" height="90" style={{ position: "absolute" }}>
              <circle cx="45" cy="45" r="38" fill="none" stroke="var(--color-border)" strokeWidth="8" />
              <circle cx="45" cy="45" r="38" fill="none" stroke="var(--color-primary)" strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 38 * score / 100} ${2 * Math.PI * 38}`}
                strokeLinecap="round" transform="rotate(-90 45 45)" />
            </svg>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-text)" }}>{score}</div>
              <div style={{ fontSize: 10, color: "var(--color-text-muted)" }}>DE 100</div>
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--color-text)", marginBottom: 6 }}>
              {score >= 70 ? "Oportunidad alta" : score >= 50 ? "Oportunidad media" : "Oportunidad baja"}
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: riskColor,
                background: riskColor + "20", padding: "3px 12px", borderRadius: 20 }}>
                Riesgo {riskLabel}
              </span>
              <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                · Prob. éxito: {parseFloat(data?.success_probability ?? 0).toFixed(0)}%
              </span>
              <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                · {data?.competitor_count ?? 0} competidores en la zona
              </span>
            </div>
          </div>
        </div>

        {/* Datos de la zona */}
        <div style={{ background: "var(--color-surface)", borderRadius: 16,
          border: "1px solid var(--color-border)", padding: 28, marginBottom: 16 }}>
          <h4 style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text)", marginBottom: 16 }}>
            Datos de la zona
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { label: "Poder adquisitivo", value: motor?.zona?.nivelPoder || data?.avg_income_level || "—" },
              { label: "Flujo de personas", value: data?.pedestrian_flow === "high" ? "Alto" : data?.pedestrian_flow === "medium" ? "Medio" : "Bajo" },
              { label: "Densidad poblacional", value: data?.population_density ? `${data.population_density.toLocaleString()} hab/km²` : "—" },
              { label: "Score de transporte", value: data?.transit_score ?? "—" },
            ].map(item => (
              <div key={item.label} style={{ padding: "14px 16px", borderRadius: 10,
                background: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)",
                  letterSpacing: 1, marginBottom: 4 }}>{item.label.toUpperCase()}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text)", textTransform: "capitalize" }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Viabilidad del rubro */}
        {motor?.rubro && (
          <div style={{ background: "var(--color-surface)", borderRadius: 16,
            border: "1px solid var(--color-border)", padding: 28, marginBottom: 16 }}>
            <h4 style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text)", marginBottom: 16 }}>
              Viabilidad del rubro elegido
            </h4>
            <div style={{ padding: "14px 18px", borderRadius: 10, marginBottom: 16,
              background: motor.rubro.viabilidad === "no_recomendado" ? "#fee2e2" : "#dcfce7",
              border: `1px solid ${motor.rubro.viabilidad === "no_recomendado" ? "#ef4444" : "#22c55e"}` }}>
              <div style={{ fontSize: 14, fontWeight: 700,
                color: motor.rubro.viabilidad === "no_recomendado" ? "#991b1b" : "#166534" }}>
                {motor.rubro.mensajeViabilidad}
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 6 }}>
                Inversión estimada: USD {motor.rubro.inversionMinUSD?.toLocaleString()} – {motor.rubro.inversionMaxUSD?.toLocaleString()}
              </div>
            </div>
            {motor.alternativas?.length > 0 && (
              <>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 10 }}>
                  Rubros alternativos recomendados:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {motor.alternativas.map((alt, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between",
                      alignItems: "center", padding: "10px 14px", borderRadius: 8,
                      background: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)" }}>
                        {alt.nombre}
                      </span>
                      <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                        USD {alt.inversionMinUSD?.toLocaleString()} – {alt.inversionMaxUSD?.toLocaleString()} · Compatibilidad: {Math.round(alt.puntajeCompatibilidad * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Botones */}
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button onClick={() => navigate("/simulador")} style={{
            background: "transparent", color: "var(--color-text)",
            border: "1px solid var(--color-border)", borderRadius: 10,
            padding: "12px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer"
          }}>Simular costos</button>
          <button onClick={() => navigate("/comparador")} style={{
            background: "transparent", color: "var(--color-text)",
            border: "1px solid var(--color-border)", borderRadius: 10,
            padding: "12px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer"
          }}>Comparar escenarios</button>
          <button onClick={() => navigate("/analisis")} style={{
            background: "var(--color-primary)", color: "var(--color-on-primary)",
            border: "none", borderRadius: 10, padding: "12px 20px",
            fontSize: 14, fontWeight: 700, cursor: "pointer"
          }}>Nuevo análisis</button>
        </div>
      </div>
    </div>
  )
}