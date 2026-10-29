import api from "./api"
import { aPayloadCostos, aPayloadEscenario, desdeBackend, escenarioPorDefecto } from "./finanzas"

// ─────────────────────────────────────────────────────────────
// Persistencia del simulador.
// El back guarda UNA estimación de costos por análisis y N escenarios de
// ingresos sobre esos costos. Los costos propios del escenario B no tienen
// lugar en el back todavía, así que el par A/B completo se guarda además en
// el navegador (por análisis) para no perderlo al recargar.
// ─────────────────────────────────────────────────────────────

const claveLocal = (analysisId) => `simulador:${analysisId ?? "sin-analisis"}`

export function leerEscenariosLocales(analysisId) {
  try {
    const raw = localStorage.getItem(claveLocal(analysisId))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function guardarEscenariosLocales(analysisId, estado) {
  try {
    localStorage.setItem(claveLocal(analysisId), JSON.stringify(estado))
  } catch {
    // almacenamiento no disponible: no es crítico
  }
}

// Trae costos y escenarios guardados del análisis. Cualquier 404 = todavía no hay.
export async function cargarDelBackend(analysisId) {
  const [costos, escenarios] = await Promise.all([
    api.get(`/cost-estimations/${analysisId}`).then((r) => r.data).catch(() => null),
    api.get(`/scenarios/analysis/${analysisId}`).then((r) => r.data).catch(() => []),
  ])
  const base = escenarioPorDefecto()
  return {
    costos,
    escenarios,
    A: costos || escenarios[0] ? desdeBackend(base, costos, escenarios[0]) : null,
    B: escenarios[1] ? desdeBackend(base, costos, escenarios[1]) : null,
  }
}

// Guarda costos (del escenario A) y los escenarios A y B (si hay B).
// Reutiliza los escenarios existentes con PATCH para no duplicarlos.
export async function guardarEnBackend(analysisId, { A, B }, existentes = []) {
  const costos = aPayloadCostos(A)
  let estimacion
  try {
    estimacion = (await api.post("/cost-estimations", { analysis_id: analysisId, ...costos })).data
  } catch (e) {
    if (e.response?.status === 409 && e.response.data?.id) {
      estimacion = (await api.patch(`/cost-estimations/${e.response.data.id}`, costos)).data
    } else {
      throw e
    }
  }

  const pares = [["Escenario A", A], ...(B ? [["Escenario B", B]] : [])]
  const guardados = []
  for (let i = 0; i < pares.length; i++) {
    const [nombre, esc] = pares[i]
    const body = aPayloadEscenario(esc, nombre)
    const previo = existentes[i]
    const { data } = previo
      ? await api.patch(`/scenarios/${previo.id}`, body)
      : await api.post("/scenarios", { analysis_id: analysisId, ...body })
    guardados.push(data)
  }
  return { estimacion, escenarios: guardados }
}
