import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from "recharts"

function MetricCard({ label, value, sub, positive }) {
  return (
    <div style={{ background: "var(--color-surface)", borderRadius: 14,
      border: "1px solid var(--color-border)", padding: 20, flex: 1 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)",
        letterSpacing: 1, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800,
        color: positive === false ? "#ef4444" : "var(--color-text)" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

export default function SimuladorDashboard({ metricas, inversionInicial }) {
  const { costosMensuales, ingresosMensuales, puntoEquilibrioUnidades, rentabilidadMensual, tiempoRecuperacionMeses } = metricas

  const fmt = (n) => "$" + Math.round(n).toLocaleString()

  // Datos para gráfico de proyección 12 meses
  const proyeccion = Array.from({ length: 12 }, (_, i) => ({
    mes: `M${i + 1}`,
    acumulado: Math.round(rentabilidadMensual * (i + 1) - inversionInicial),
  }))

  const comparativa = [
    { name: "Ingresos", valor: Math.round(ingresosMensuales) },
    { name: "Costos", valor: Math.round(costosMensuales) },
    { name: "Rentabilidad", valor: Math.round(rentabilidadMensual) },
  ]

  return (
    <div>
      {/* Tarjetas de métricas */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
        <MetricCard label="INVERSIÓN INICIAL" value={fmt(inversionInicial)} />
        <MetricCard label="COSTOS MENSUALES" value={fmt(costosMensuales)} />
        <MetricCard label="INGRESOS ESTIMADOS" value={fmt(ingresosMensuales)} />
        <MetricCard label="PUNTO DE EQUILIBRIO" value={`${puntoEquilibrioUnidades} unid/mes`} />
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
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
        <ResponsiveContainer width="100%" height={220}>
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

      {/* Gráfico de proyección */}
      <div style={{ background: "var(--color-surface)", borderRadius: 14,
        border: "1px solid var(--color-border)", padding: 20 }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text)", marginBottom: 16 }}>
          Proyección de recuperación de inversión (12 meses)
        </h4>
        <ResponsiveContainer width="100%" height={220}>
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