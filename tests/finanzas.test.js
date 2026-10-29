import { test } from "node:test"
import assert from "node:assert/strict"
import {
  calcularMetricas, compararEscenarios, aPayloadCostos, aPayloadEscenario,
  desdeBackend, escenarioPorDefecto, proyeccion, formatear,
} from "../src/services/finanzas.js"

const base = {
  renovacion: 1000000, mobiliario: 500000, equipamiento: 500000, software: 0, marketing: 0, stock: 0,
  alquiler: 300000, salarios: 500000, servicios: 100000, proveedores: 50000, otros: 50000,
  precioPromedio: 4000, ventasMensuales: 1000, margen: 40,
}

test("suma los 6 rubros de inversión y los 5 costos mensuales", () => {
  const m = calcularMetricas(base)
  assert.equal(m.inversionInicial, 2000000)
  assert.equal(m.costosMensuales, 1000000)
  assert.equal(m.ingresosMensuales, 4000000)
})

test("rentabilidad = ingresos × margen − costos fijos", () => {
  const m = calcularMetricas(base)
  assert.equal(m.rentabilidadMensual, 4000000 * 0.4 - 1000000) // 600.000
  assert.equal(m.tiempoRecuperacionMeses, Math.ceil(2000000 / 600000)) // 4
  assert.equal(m.roiAnual, 360)
  assert.equal(m.puntoEquilibrioUnidades, Math.ceil(1000000 / 1600)) // 625
})

test("sin rentabilidad no hay recuperación y avisa", () => {
  const m = calcularMetricas({ ...base, ventasMensuales: 100 })
  assert.ok(m.rentabilidadMensual < 0)
  assert.equal(m.tiempoRecuperacionMeses, null)
  assert.match(m.alertas[0], /no cubre/)
})

test("margen 0 no divide por cero en el punto de equilibrio", () => {
  const m = calcularMetricas({ ...base, margen: 0 })
  assert.equal(m.puntoEquilibrioUnidades, null)
  assert.equal(formatear(m.puntoEquilibrioUnidades, "ventas"), "No alcanzable")
})

test("la proyección arranca en −inversión y sube con la rentabilidad", () => {
  const p = proyeccion(base, 6)
  assert.equal(p[0], 600000 - 2000000)
  assert.equal(p[3], 4 * 600000 - 2000000) // mes 4: recuperado
  assert.equal(p.length, 6)
})

test("comparar A vs B marca ganador por indicador y recomienda el más rentable", () => {
  const B = { ...base, alquiler: 600000, ventasMensuales: 1500 } // más alquiler, más ventas
  const r = compararEscenarios(base, B)
  const fila = (k) => r.filas.find((f) => f.key === k)
  assert.equal(fila("costosMensuales").ganador, "A")
  assert.equal(fila("rentabilidadMensual").ganador, "B")
  assert.equal(fila("rentabilidadMensual").diferencia, (6000000 * 0.4 - 1300000) - 600000)
  assert.equal(r.recomendado, "B")
})

test("escenarios iguales: sin ganador ni recomendado", () => {
  const r = compararEscenarios(base, { ...base })
  assert.ok(r.filas.every((f) => f.ganador === null))
  assert.equal(r.recomendado, null)
})

test("payload de costos usa los nombres del back y suma 'otros' a servicios", () => {
  const p = aPayloadCostos(base)
  assert.deepEqual(p, {
    renovation_cost: 1000000, furniture_cost: 500000, equipment_cost: 500000,
    software_cost: 0, marketing_initial: 0, initial_stock: 0,
    monthly_salaries: 500000, monthly_services: 150000, monthly_suppliers: 50000,
    rent_monthly_override: 300000,
  })
})

test("payload de escenario manda ingresos brutos y el margen", () => {
  const p = aPayloadEscenario(base, "Escenario A")
  assert.deepEqual(p, {
    name: "Escenario A", monthly_revenue_est: 4000000,
    avg_product_price: 4000, monthly_sales_vol: 1000, profit_margin: 40,
  })
  assert.equal(aPayloadEscenario({ ...base, ventasMensuales: 0 }, "x").monthly_revenue_est, 1) // el back exige > 0
})

test("desdeBackend reconstruye el escenario con lo guardado", () => {
  const costos = { renovation_cost: "800000.00", monthly_salaries: "700000", monthly_services: "90000", rent_monthly_override: "250000" }
  const esc = { avg_product_price: "5000", monthly_sales_vol: "800", profit_margin: "30" }
  const e = desdeBackend(escenarioPorDefecto(), costos, esc)
  assert.equal(e.renovacion, 800000)
  assert.equal(e.salarios, 700000)
  assert.equal(e.alquiler, 250000)
  assert.equal(e.otros, 0)
  assert.equal(e.precioPromedio, 5000)
  assert.equal(e.margen, 30)
})
