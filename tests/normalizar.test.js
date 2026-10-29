import { test } from "node:test"
import assert from "node:assert/strict"
import {
  normalizarAnalisis, porcentaje, agruparPorDistancia, categoriaTrends, nombreAnalisis,
} from "../src/services/normalizar.js"

const zona = { poderAdquisitivoScore: 0.89, demandaPotencialScore: 0.2, nivelPoder: "alto", descripcionZona: "Zona X" }
const rubro = { nombre: "Joyería", viabilidad: "no_recomendado" }

test("formato viejo: motorAnalisis.motorAnalisis", () => {
  const a = normalizarAnalisis({ id: 1, motorAnalisis: { motorAnalisis: { zona, rubro, alternativas: [{ nombre: "Spa" }] } } })
  assert.equal(a.motor.zona.poderAdquisitivoScore, 0.89)
  assert.equal(a.motor.alternativas[0].nombre, "Spa")
})

test("back actual: motor_analisis plano, breakdown y riesgo", () => {
  const a = normalizarAnalisis({ id: 2, motor_analisis: { zona, rubro, riesgo: { level: "high" } }, breakdown: { transport: { score: 25 } } })
  assert.equal(a.motor.rubro.nombre, "Joyería")
  assert.equal(a.riesgo.level, "high")
  assert.equal(porcentaje(a.breakdown, "transport"), 100)
})

test("motor_analisis como string JSON", () => {
  const a = normalizarAnalisis({ id: 3, motor_analisis: JSON.stringify({ zona, rubro }) })
  assert.equal(a.motor.zona.nivelPoder, "alto")
})

test("historial sin breakdown: se reconstruye con las fórmulas del back", () => {
  const a = normalizarAnalisis({ id: 4, competitor_count: 2, transit_score: 4, pedestrian_flow: "medium", motor_analisis: { zona, rubro } })
  assert.equal(a.breakdown.estimado, true)
  assert.equal(a.breakdown.competition.score, 25)
  assert.equal(a.breakdown.transport.score, 10)
  assert.equal(a.breakdown.poder_adq.score, 22)
})

test("sin motor no inventa porcentajes", () => {
  const a = normalizarAnalisis({ id: 5, motor_analisis: { zona: null, rubro: null, breakdown: { competition: { score: 35 } } } })
  assert.equal(a.motor, null)
  assert.equal(porcentaje(a.breakdown, "competition"), 100)
  assert.equal(porcentaje({}, "transport"), null)
})

test("ubicación incluida en la fila y nombre corto", () => {
  const a = normalizarAnalisis({ id: 6, latitude: "-34.6", longitude: "-58.4", radius_m: 800, neighborhood: "Palermo", business_name: "Café", business_category: "Gastronomía" })
  assert.deepEqual(a._mapPosition, { lat: -34.6, lng: -58.4 })
  assert.equal(a._radius, 800)
  assert.equal(a._businessCategory, "Gastronomía")
  assert.equal(nombreAnalisis(a), "Café · Palermo")
})

test("competidores agrupados por distancia", () => {
  const r = agruparPorDistancia([{ distance_m: 50, rating: 4 }, { distance_m: 120, rating: 5 }, { distance_m: 499 }, { distance_m: 900 }], 500)
  assert.deepEqual(r.grupos.map((g) => g.value), [1, 1, 0, 0, 2])
  assert.equal(r.ratingPromedio, 4.5)
})

test("categoría del rubro → categoría de Google Trends", () => {
  assert.equal(categoriaTrends("Gastronomía"), "gastronomia")
  assert.equal(categoriaTrends("Retail"), "comercio")
  assert.equal(categoriaTrends("Estética"), "estetica")
  assert.equal(categoriaTrends("Salud"), null)
  assert.equal(categoriaTrends(undefined), null)
})
