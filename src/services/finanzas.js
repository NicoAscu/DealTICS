// ─────────────────────────────────────────────────────────────
// Cálculos del simulador financiero (secciones 7 y 8 del anteproyecto).
// Funciones puras, sin React ni axios, para poder testearlas con `npm test`.
//
// Fórmula (la misma que usa el back con el parche de financeService):
//   ingresos      = precio promedio × ventas mensuales
//   contribución  = ingresos × margen%            (lo que queda después del costo del producto)
//   rentabilidad  = contribución − costos mensuales fijos
//   recuperación  = inversión inicial / rentabilidad   (meses, si rentabilidad > 0)
//   ROI anual     = rentabilidad × 12 / inversión inicial
// ─────────────────────────────────────────────────────────────

// Inversión inicial: los 6 rubros del anteproyecto, con su campo en el back
export const CAMPOS_INICIALES = [
  { key: "renovacion",   label: "Remodelación del local",  api: "renovation_cost",   max: 20000000, step: 100000 },
  { key: "mobiliario",   label: "Mobiliario",              api: "furniture_cost",    max: 10000000, step: 50000 },
  { key: "equipamiento", label: "Equipamiento",            api: "equipment_cost",    max: 20000000, step: 100000 },
  { key: "software",     label: "Sistema de cobro / software", api: "software_cost", max: 3000000,  step: 10000 },
  { key: "marketing",    label: "Marketing inicial",       api: "marketing_initial", max: 5000000,  step: 50000 },
  { key: "stock",        label: "Stock inicial",           api: "initial_stock",     max: 10000000, step: 50000 },
]

// Costos operativos mensuales
export const CAMPOS_MENSUALES = [
  { key: "alquiler",    label: "Alquiler del local",       api: "rent_monthly_override", max: 5000000, step: 10000 },
  { key: "salarios",    label: "Salarios",                 api: "monthly_salaries",  max: 10000000, step: 50000 },
  { key: "servicios",   label: "Servicios (luz, gas, internet)", api: "monthly_services", max: 2000000, step: 10000 },
  { key: "proveedores", label: "Proveedores fijos",        api: "monthly_suppliers", max: 5000000,  step: 10000 },
  { key: "otros",       label: "Otros gastos administrativos", api: null,            max: 2000000,  step: 10000 },
]

export const CAMPOS_COMERCIALES = [
  { key: "precioPromedio",  label: "Precio promedio por venta", min: 100, max: 100000, step: 100, prefix: "$" },
  { key: "ventasMensuales", label: "Ventas mensuales estimadas", min: 0,  max: 10000,  step: 10,  suffix: " ventas" },
  { key: "margen",          label: "Margen por venta (precio − costo del producto)", min: 1, max: 95, step: 1, suffix: "%" },
]

export function escenarioPorDefecto() {
  return {
    renovacion: 1500000, mobiliario: 1000000, equipamiento: 1200000,
    software: 150000, marketing: 300000, stock: 350000,
    alquiler: 350000, salarios: 800000, servicios: 120000, proveedores: 0, otros: 0,
    precioPromedio: 3500, ventasMensuales: 1200, margen: 35,
  }
}

const n = (v) => Number(v) || 0
const sumar = (e, campos) => campos.reduce((s, c) => s + n(e[c.key]), 0)

export function calcularMetricas(e) {
  const inversionInicial = sumar(e, CAMPOS_INICIALES)
  const costosMensuales = sumar(e, CAMPOS_MENSUALES)
  const ingresosMensuales = n(e.precioPromedio) * n(e.ventasMensuales)
  const contribucionUnidad = n(e.precioPromedio) * (n(e.margen) / 100)
  const rentabilidadMensual = ingresosMensuales * (n(e.margen) / 100) - costosMensuales

  const puntoEquilibrioUnidades = contribucionUnidad > 0 ? Math.ceil(costosMensuales / contribucionUnidad) : null
  const puntoEquilibrioIngresos = puntoEquilibrioUnidades != null ? puntoEquilibrioUnidades * n(e.precioPromedio) : null
  const tiempoRecuperacionMeses = rentabilidadMensual > 0 ? Math.ceil(inversionInicial / rentabilidadMensual) : null
  const roiAnual = inversionInicial > 0
    ? Math.round((rentabilidadMensual * 12 / inversionInicial) * 1000) / 10
    : 0

  const clasificacionViabilidad =
    roiAnual >= 30 ? "riesgo_bajo" : roiAnual >= 15 ? "riesgo_medio" : "riesgo_alto"

  const alertas = []
  if (rentabilidadMensual < 0) alertas.push("Con estas ventas el negocio no cubre sus costos mensuales.")
  else if (tiempoRecuperacionMeses > 36) alertas.push("La inversión tarda más de 3 años en recuperarse.")
  if (rentabilidadMensual >= 0 && roiAnual < 10) alertas.push("ROI anual bajo: probá ajustar precios o reducir costos.")

  return {
    inversionInicial, costosMensuales, ingresosMensuales, rentabilidadMensual,
    puntoEquilibrioUnidades, puntoEquilibrioIngresos, tiempoRecuperacionMeses,
    roiAnual, clasificacionViabilidad, alertas,
  }
}

// Proyección del acumulado mes a mes (arranca en −inversión)
export function proyeccion(e, meses = 24) {
  const m = calcularMetricas(e)
  return Array.from({ length: meses }, (_, i) => Math.round(m.rentabilidadMensual * (i + 1) - m.inversionInicial))
}

// ── Back ↔ front ─────────────────────────────────────────────

// Body para POST/PATCH /cost-estimations.
// "Otros gastos" no tiene columna propia en el back: se suma a servicios.
// rent_monthly_override reemplaza el alquiler estimado por el back (requiere el parche).
export function aPayloadCostos(e) {
  const body = {}
  for (const c of CAMPOS_INICIALES) body[c.api] = n(e[c.key])
  body.monthly_salaries = n(e.salarios)
  body.monthly_services = n(e.servicios) + n(e.otros)
  body.monthly_suppliers = n(e.proveedores)
  body.rent_monthly_override = n(e.alquiler)
  return body
}

// Body para POST/PATCH /scenarios
export function aPayloadEscenario(e, nombre) {
  const m = calcularMetricas(e)
  return {
    name: nombre,
    monthly_revenue_est: Math.max(1, Math.round(m.ingresosMensuales)), // el back exige > 0
    avg_product_price: n(e.precioPromedio),
    monthly_sales_vol: n(e.ventasMensuales),
    profit_margin: n(e.margen),
  }
}

// Completa un escenario con lo que ya hay guardado en el back
export function desdeBackend(base, costos, escenario) {
  const e = { ...base }
  if (costos) {
    for (const c of CAMPOS_INICIALES) if (costos[c.api] != null) e[c.key] = n(costos[c.api])
    if (costos.monthly_salaries != null) e.salarios = n(costos.monthly_salaries)
    if (costos.monthly_services != null) { e.servicios = n(costos.monthly_services); e.otros = 0 }
    if (costos.monthly_suppliers != null) e.proveedores = n(costos.monthly_suppliers)
    if (costos.rent_monthly_override != null) e.alquiler = n(costos.rent_monthly_override)
  }
  if (escenario) {
    if (escenario.avg_product_price != null && n(escenario.avg_product_price) > 0) e.precioPromedio = n(escenario.avg_product_price)
    if (escenario.monthly_sales_vol != null && n(escenario.monthly_sales_vol) > 0) e.ventasMensuales = n(escenario.monthly_sales_vol)
    if (escenario.profit_margin != null && n(escenario.profit_margin) > 0) e.margen = n(escenario.profit_margin)
  }
  return e
}

// ── Comparación A vs B ───────────────────────────────────────

const INDICADORES = [
  { key: "inversionInicial",        label: "Inversión inicial",       tipo: "dinero", mejor: "menor" },
  { key: "costosMensuales",         label: "Costos mensuales",        tipo: "dinero", mejor: "menor" },
  { key: "ingresosMensuales",       label: "Ingresos mensuales",      tipo: "dinero", mejor: "mayor" },
  { key: "rentabilidadMensual",     label: "Rentabilidad mensual",    tipo: "dinero", mejor: "mayor" },
  { key: "puntoEquilibrioUnidades", label: "Punto de equilibrio",     tipo: "ventas", mejor: "menor" },
  { key: "tiempoRecuperacionMeses", label: "Recuperación",            tipo: "meses",  mejor: "menor" },
  { key: "roiAnual",                label: "ROI anual",               tipo: "pct",    mejor: "mayor" },
]

export function compararEscenarios(a, b) {
  const ma = calcularMetricas(a)
  const mb = calcularMetricas(b)
  const filas = INDICADORES.map((ind) => {
    const va = ma[ind.key]
    const vb = mb[ind.key]
    let ganador = null
    if (va == null && vb != null) ganador = "B"
    else if (vb == null && va != null) ganador = "A"
    else if (va != null && vb != null && va !== vb) {
      ganador = (ind.mejor === "mayor" ? vb > va : vb < va) ? "B" : "A"
    }
    const diferencia = va != null && vb != null ? Math.round((vb - va) * 10) / 10 : null
    return { ...ind, a: va, b: vb, diferencia, ganador }
  })
  const puntos = { A: 0, B: 0 }
  for (const f of filas) if (f.ganador) puntos[f.ganador] += 1
  // El que más rentabilidad deja es el recomendado; desempata el recupero
  let recomendado = null
  if (mb.rentabilidadMensual !== ma.rentabilidadMensual) {
    recomendado = mb.rentabilidadMensual > ma.rentabilidadMensual ? "B" : "A"
  }
  return { filas, puntos, recomendado, metricas: { A: ma, B: mb } }
}

export function formatear(valor, tipo) {
  if (valor == null) return "No alcanzable"
  if (tipo === "dinero") return (valor < 0 ? "−$" : "$") + Math.abs(Math.round(valor)).toLocaleString("es-AR")
  if (tipo === "pct") return `${valor}%`
  if (tipo === "meses") return `${valor} meses`
  if (tipo === "ventas") return `${valor.toLocaleString("es-AR")} ventas/mes`
  return String(valor)
}
