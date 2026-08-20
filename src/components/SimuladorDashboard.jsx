import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from "recharts"

const viabilidadConfig = {
  riesgo_bajo:  { label: "Riesgo bajo",  color: "#22c55e", bg: "#dcfce7" },
  riesgo_medio: { label: "Riesgo medio", color: "#f59e0b", bg: "#fef3c7" },
  riesgo_alto:  { label: "Riesgo alto",  color: "#ef4444", bg: "#fee2e2" },
}

function MetricCard({ label, value, sub, positive }) {
  return (
    <div style={{ background: "var(--color-surface)", borderRadius: 14,
      border: "1px solid var(--color-border)", padding: 20, flex: 1 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)",
        letterSpacing: 1, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800,
        color: positive === false ? "#ef4444" : "var(--color-text)" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

export default function SimuladorDashboard({ metricas, inversionInicial }) {
  const {
    costosMensuales, ingresosMensuales, puntoEquilibrioUnidades,
    puntoEquilibrioIngresos, rentabilidadMensual, tiempoRecuperacionMeses,
    roiAnual, clasificacionViabilidad, alertas
  } = metricas

  const fmt = (n) => "$" + Math.round(n).toLocaleString()
  const viab = viabilidadConfig[clasificacionViabilidad] || viabilidadConfig.riesgo_medio

  const proyeccion = Array.from({ length: 12 }, (_, i) => ({
    mes: `M${i + 1}`,
    acumulado: Math.round(rentabilidadMensual * (i + 1) - inversionInicial),
  }))

  const comparativa = [
    { name: "Ingresos", valor: Math.round(ingresosMensuales) },
    { name: "Costos", valor: Math.round(costosMensuales) },
    { name: "Rentabilidad", valor: Math.round(Math.max(rentabilidadMensual, 0)) },
  ]

  return (
    <div>
      {/* Badge de viabilidad */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{ background: viab.bg, color: viab.color, borderRadius: 20,
          padding: "6px 16px", fontSize: 13, fontWeight: 700 }}>
          {viab.label}
        </div>
        <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
          ROI anual: <strong style={{ color: "var(--color-text)" }}>{roiAnual}%</strong>
        </span>
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <div style={{ background: "#fef3c7", borderRadius: 10, padding: "12px 16px",
          marginBottom: 16, border: "1px solid #f59e0b" }}>
          {alertas.map((a, i) => (
            <div key={i} style={{ fontSize: 13, color: "#92400e", marginBottom: i < alertas.length - 1 ? 4 : 0 }}>
              {a}
            </div>
          ))}
        </div>
      )}

      {/* Tarjetas métricas */}
      <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <MetricCard label="INVERSIÓN INICIAL" value={fmt(inversionInicial)} />
        <MetricCard label="COSTOS MENSUALES" value={fmt(costosMensuales)} />
        <MetricCard label="INGRESOS ESTIMADOS" value={fmt(ingresosMensuales)} />
        <MetricCard label="ROI ANUAL" value={`${roiAnual}%`} positive={roiAnual >= 15} />
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <MetricCard label="PUNTO DE EQUILIBRIO"
          value={`${puntoEquilibrioUnidades} unid/mes`}
          sub={`= ${fmt(puntoEquilibrioIngresos)} ARS`} />
        <MetricCard label="RENTABILIDAD MENSUAL" value={fmt(rentabilidadMensual)}
          positive={rentabilidadMensual >= 0} />
        <MetricCard label="RECUPERACIÓN DE INVERSIÓN"
          value={tiempoRecuperacionMeses ? `${tiempoRecuperacionMeses} meses` : "No alcanzable"}
          positive={tiempoRecuperacionMeses !== null} />
      </div>

      {/* Gráfico comparativo */}
      <div style={{ background: "var(--color-surface)", borderRadius: 14,
        border: "1px solid var(--color-border)", padding: 20, marginBottom: 16 }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text)", marginBottom: 16 }}>
          Ingresos vs Costos vs Rentabilidad
        </h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={comparativa}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={12} />
            <YAxis stroke="var(--color-text-muted)" fontSize={12} />
            <Tooltip formatter={(v) => "$" + v.toLocaleString()}
              contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }} />
            <Bar dataKey="valor" fill="#4a7fd4" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Proyección 12 meses */}
      <div style={{ background: "var(--color-surface)", borderRadius: 14,
        border: "1px solid var(--color-border)", padding: 20 }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text)", marginBottom: 16 }}>
          Proyección de recuperación (12 meses)
        </h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={proyeccion}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="mes" stroke="var(--color-text-muted)" fontSize={12} />
            <YAxis stroke="var(--color-text-muted)" fontSize={12} />
            <Tooltip formatter={(v) => "$" + v.toLocaleString()}
              contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }} />
            <Line type="monotone" dataKey="acumulado" stroke="#4a7fd4" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}