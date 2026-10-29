import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, Legend, ReferenceLine,
} from "recharts"
import { compararEscenarios, proyeccion, formatear } from "../services/finanzas"

const COLOR_A = "#1a2b4a"
const COLOR_B = "#4a7fd4"

const card = {
  background: "var(--color-surface)", borderRadius: 14,
  border: "1px solid var(--color-border)", padding: 20, marginBottom: 16,
}
const tooltipStyle = { background: "var(--color-surface)", border: "1px solid var(--color-border)" }
const fmtEje = (v) => (Math.abs(v) >= 1e6 ? `${Math.round(v / 1e5) / 10}M` : Math.abs(v) >= 1e3 ? `${Math.round(v / 1e3)}k` : v)

// Comparación de dos escenarios financieros (sección 8 del anteproyecto)
export default function ComparacionEscenarios({ A, B, nombres = { A: "Escenario A", B: "Escenario B" } }) {
  const { filas, recomendado, metricas } = compararEscenarios(A, B)

  const barras = [
    { name: "Ingresos", A: metricas.A.ingresosMensuales, B: metricas.B.ingresosMensuales },
    { name: "Costos", A: metricas.A.costosMensuales, B: metricas.B.costosMensuales },
    { name: "Rentabilidad", A: metricas.A.rentabilidadMensual, B: metricas.B.rentabilidadMensual },
  ].map((d) => ({ ...d, A: Math.round(d.A), B: Math.round(d.B) }))

  const pa = proyeccion(A, 24)
  const pb = proyeccion(B, 24)
  const lineas = pa.map((v, i) => ({ mes: `M${i + 1}`, A: v, B: pb[i] }))

  const diferenciaRent = metricas.B.rentabilidadMensual - metricas.A.rentabilidadMensual

  return (
    <div>
      <div style={{ ...card, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text)" }}>
          {recomendado
            ? `${nombres[recomendado]} deja ${formatear(Math.abs(diferenciaRent), "dinero")} más por mes`
            : "Los dos escenarios dejan la misma rentabilidad mensual"}
        </div>
        {recomendado && (
          <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            Recupera la inversión en {formatear(metricas[recomendado].tiempoRecuperacionMeses, "meses")}
          </span>
        )}
      </div>

      <div style={{ ...card, padding: 0, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: "left", color: "var(--color-text-muted)", fontSize: 11, letterSpacing: 1 }}>
              <th style={{ padding: "12px 16px" }}>INDICADOR</th>
              <th style={{ padding: "12px 16px", color: COLOR_A }}>{nombres.A.toUpperCase()}</th>
              <th style={{ padding: "12px 16px", color: COLOR_B }}>{nombres.B.toUpperCase()}</th>
              <th style={{ padding: "12px 16px" }}>DIFERENCIA (B − A)</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.key} style={{ borderTop: "1px solid var(--color-border)", color: "var(--color-text)" }}>
                <td style={{ padding: "10px 16px" }}>{f.label}</td>
                <td style={{ padding: "10px 16px", fontWeight: f.ganador === "A" ? 800 : 400 }}>
                  {formatear(f.a, f.tipo)}{f.ganador === "A" ? " ✓" : ""}
                </td>
                <td style={{ padding: "10px 16px", fontWeight: f.ganador === "B" ? 800 : 400 }}>
                  {formatear(f.b, f.tipo)}{f.ganador === "B" ? " ✓" : ""}
                </td>
                <td style={{ padding: "10px 16px", color: "var(--color-text-muted)" }}>
                  {f.diferencia == null ? "—" : (f.diferencia > 0 ? "+" : "") + formatear(f.diferencia, f.tipo)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={card}>
        <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text)", marginBottom: 16 }}>
          Resultado mensual por escenario (ARS)
        </h4>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barras}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={12} />
            <YAxis stroke="var(--color-text-muted)" fontSize={12} tickFormatter={fmtEje} />
            <Tooltip formatter={(v) => formatear(v, "dinero")} contentStyle={tooltipStyle} />
            <Legend />
            <ReferenceLine y={0} stroke="var(--color-text-muted)" />
            <Bar dataKey="A" name={nombres.A} fill={COLOR_A} radius={[6, 6, 0, 0]} />
            <Bar dataKey="B" name={nombres.B} fill={COLOR_B} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={card}>
        <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text)", marginBottom: 4 }}>
          Recuperación de la inversión (acumulado, 24 meses)
        </h4>
        <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 12 }}>
          Donde cada línea cruza el cero, ese escenario recuperó lo invertido.
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={lineas}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="mes" stroke="var(--color-text-muted)" fontSize={12} interval={3} />
            <YAxis stroke="var(--color-text-muted)" fontSize={12} tickFormatter={fmtEje} />
            <Tooltip formatter={(v) => formatear(v, "dinero")} contentStyle={tooltipStyle} />
            <Legend />
            <ReferenceLine y={0} stroke="var(--color-text-muted)" />
            <Line type="monotone" dataKey="A" name={nombres.A} stroke={COLOR_A} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="B" name={nombres.B} stroke={COLOR_B} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
