import { useState, useMemo } from "react"
import SimuladorDashboard from "../components/SimuladorDashboard"

function calcularMetricas({ alquiler, salarios, servicios, inversionInicial, precioPromedio, ventasMensuales, margen }) {
  const costosMensuales = alquiler + salarios + servicios
  const ingresosMensuales = precioPromedio * ventasMensuales
  const gananciaUnidad = precioPromedio * (margen / 100)
  const puntoEquilibrioUnidades = gananciaUnidad > 0 ? Math.ceil(costosMensuales / gananciaUnidad) : 0
  const rentabilidadMensual = ingresosMensuales * (margen / 100) - costosMensuales
  const tiempoRecuperacionMeses = rentabilidadMensual > 0 ? Math.ceil(inversionInicial / rentabilidadMensual) : null

  return {
    costosMensuales,
    ingresosMensuales,
    puntoEquilibrioUnidades,
    rentabilidadMensual,
    tiempoRecuperacionMeses,
  }
}

function Slider({ label, value, onChange, min, max, step, prefix = "", suffix = "" }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)" }}>{label}</label>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-accent)" }}>
          {prefix}{value.toLocaleString()}{suffix}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "var(--color-accent)" }} />
      <input type="number" value={value} onChange={e => onChange(Number(e.target.value) || 0)}
        style={{
          width: "100%", marginTop: 6, padding: "8px 12px", borderRadius: 8,
          border: "1px solid var(--color-border)", background: "var(--color-bg)",
          color: "var(--color-text)", fontSize: 13, outline: "none"
        }} />
    </div>
  )
}

export default function Simulador() {
  const [alquiler, setAlquiler] = useState(350000)
  const [salarios, setSalarios] = useState(800000)
  const [servicios, setServicios] = useState(120000)
  const [inversionInicial, setInversionInicial] = useState(4500000)
  const [precioPromedio, setPrecioPromedio] = useState(3500)
  const [ventasMensuales, setVentasMensuales] = useState(900)
  const [margen, setMargen] = useState(35)

  const metricas = useMemo(() => calcularMetricas({
    alquiler, salarios, servicios, inversionInicial, precioPromedio, ventasMensuales, margen
  }), [alquiler, salarios, servicios, inversionInicial, precioPromedio, ventasMensuales, margen])

  return (
    <div className="page-enter" style={{ display: "flex", minHeight: "calc(100vh - 56px)", background: "var(--color-bg)" }}>

      {/* Panel izquierdo — controles */}
      <div style={{ width: 380, background: "var(--color-surface)", margin: 16,
        borderRadius: 16, padding: 28, border: "1px solid var(--color-border)",
        height: "fit-content" }}>

        <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--color-text)", marginBottom: 4 }}>
          Simulador de escenarios
        </h2>
        <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 24 }}>
          Ajustá las variables para ver cómo cambia la rentabilidad.
        </p>

        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)",
          letterSpacing: 1, marginBottom: 12 }}>COSTOS</div>
        <Slider label="Alquiler mensual" value={alquiler} onChange={setAlquiler}
          min={50000} max={1500000} step={10000} prefix="$" />
        <Slider label="Salarios" value={salarios} onChange={setSalarios}
          min={0} max={3000000} step={50000} prefix="$" />
        <Slider label="Servicios" value={servicios} onChange={setServicios}
          min={0} max={500000} step={10000} prefix="$" />
        <Slider label="Inversión inicial" value={inversionInicial} onChange={setInversionInicial}
          min={500000} max={20000000} step={100000} prefix="$" />

        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)",
          letterSpacing: 1, marginBottom: 12, marginTop: 24 }}>VARIABLES COMERCIALES</div>
        <Slider label="Precio promedio" value={precioPromedio} onChange={setPrecioPromedio}
          min={500} max={50000} step={100} prefix="$" />
        <Slider label="Ventas mensuales estimadas" value={ventasMensuales} onChange={setVentasMensuales}
          min={10} max={5000} step={10} suffix=" unid." />
        <Slider label="Margen de ganancia" value={margen} onChange={setMargen}
          min={5} max={80} step={1} suffix="%" />
      </div>

      {/* Panel derecho — dashboard */}
      <div style={{ flex: 1, padding: 16 }}>
        <SimuladorDashboard metricas={metricas} inversionInicial={inversionInicial} />
      </div>
    </div>
  )
}

export { calcularMetricas }