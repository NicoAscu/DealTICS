import api from "./api"

// ─────────────────────────────────────────────────────────────
// Todo lo relacionado a análisis pasa por acá, así cada pantalla
// recibe SIEMPRE la misma forma de objeto, venga de donde venga
// (POST recién creado, GET del historial, localStorage viejo).
//
// Forma normalizada:
// {
//   ...columnas de la tabla analyses (id, opportunity_index, risk_level, ...),
//   motor:     { zona, rubro, alternativas, riesgo, radio } | null,
//   breakdown: { competition, transport, poder_adq, flujo, total, estimado } ,
//   _mapPosition: { lat, lng } | null,
//   _radius: number,
//   _neighborhood, _address
// }
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = "analysisResult"

// Máximos de cada componente del índice (scoringService.js del back)
export const MAX_SCORES = { competition: 35, transport: 25, poder_adq: 25, flujo: 15 }

// El resultado del motor puede venir en 3 formatos según la versión del back
function extraerMotor(raw) {
  const m =
    raw?.motor_analisis ??                 // back actual (columna JSONB)
    raw?.motorAnalisis?.motorAnalisis ??   // back viejo
    raw?.motorAnalisis ??
    raw?.motor ??                          // ya normalizado
    null
  if (!m) return null
  const obj = typeof m === "string" ? safeParse(m) : m
  if (!obj || (!obj.zona && !obj.rubro)) return null
  return {
    zona: obj.zona ?? null,
    rubro: obj.rubro ?? null,
    alternativas: obj.alternativas ?? [],
    riesgo: obj.riesgo ?? raw?.riesgo ?? null,
    radio: obj.radio ?? null,
    breakdown: obj.breakdown ?? null,
  }
}

function safeParse(s) {
  try { return JSON.parse(s) } catch { return null }
}

// Si el back no devolvió el breakdown (análisis del historial), lo
// reconstruimos con las mismas fórmulas a partir de lo guardado.
function reconstruirBreakdown(raw, motor) {
  const count = Number(raw?.competitor_count ?? 0)
  const transit = Number(raw?.transit_score ?? 0)
  const poder = motor?.zona?.poderAdquisitivoScore
  const flujo = { high: 15, medium: 10, low: 5 }[raw?.pedestrian_flow] ?? 0

  const competition = Math.max(0, 35 - count * 5)
  const transport = Math.round((transit / 10) * 25)
  const poderScore = poder != null ? Math.round(poder * 25) : null

  return {
    competition: { score: competition, competitors_found: count },
    transport: { score: transport, transit_score: transit },
    poder_adq: { score: poderScore, raw: poder ?? null },
    flujo: { score: flujo },
    total: Number(raw?.opportunity_index ?? 0),
    estimado: true,
  }
}

export function normalizarAnalisis(raw, extras = {}) {
  if (!raw) return null
  const motor = extraerMotor(raw)
  const crudo = typeof raw.motor_analisis === "string" ? safeParse(raw.motor_analisis) : raw.motor_analisis
  const breakdown = raw.breakdown ?? crudo?.breakdown ?? motor?.breakdown ?? reconstruirBreakdown(raw, motor)

  // La ubicación puede venir aparte (GET /locations/:id) o ya incluida en la fila
  const loc = extras.location ?? (raw.latitude != null ? raw : null)
  const mapPosition =
    extras._mapPosition ??
    raw._mapPosition ??
    (loc ? { lat: Number(loc.latitude), lng: Number(loc.longitude) } : null)

  return {
    ...raw,
    motorAnalisis: undefined,
    motor,
    breakdown,
    riesgo: raw.riesgo ?? motor?.riesgo ?? null,
    _mapPosition: mapPosition,
    _radius: Number(extras._radius ?? raw._radius ?? loc?.radius_m ?? 500),
    _neighborhood: raw._neighborhood ?? loc?.neighborhood ?? raw.neighborhood ?? null,
    _address: raw._address ?? loc?.address ?? raw.address ?? null,
  }
}

// Porcentaje 0-100 de un componente del breakdown, o null si no hay dato
export function porcentaje(breakdown, key) {
  const score = breakdown?.[key]?.score
  if (score == null) return null
  return Math.round((Number(score) / MAX_SCORES[key]) * 100)
}

// ── localStorage: análisis "actual" entre pantallas ──────────
export function guardarAnalisisActual(analisis) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(analisis))
}

export function leerAnalisisActual() {
  const raw = safeParse(localStorage.getItem(STORAGE_KEY))
  return raw ? normalizarAnalisis(raw) : null
}

// ── Llamadas al backend ──────────────────────────────────────

// Crea ubicación + análisis. Lanza el error de axios si algo falla.
export async function crearAnalisis({ lat, lng, radius, businessId }) {
  const { data: location } = await api.post("/locations", {
    latitude: lat,
    longitude: lng,
    radius_m: radius,
  })
  const { data } = await api.post("/analyses", {
    location_id: location.id,
    business_id: Number(businessId),
  })
  return normalizarAnalisis(data, { location, _mapPosition: { lat, lng }, _radius: radius })
}

// Trae un análisis guardado con su ubicación (para historial / comparador)
export async function cargarAnalisis(id) {
  const { data } = await api.get(`/analyses/${id}`)
  let location = null
  // Si el back ya devuelve lat/lng en la fila, no hace falta otra request
  if (data.latitude == null && data.location_id) {
    try {
      location = (await api.get(`/locations/${data.location_id}`)).data
    } catch {
      // Ubicaciones viejas sin dueño: seguimos sin mapa
    }
  }
  return normalizarAnalisis(data, { location })
}

export async function listarHistorial(userId) {
  const { data } = await api.get(`/analyses/user/${userId}`)
  return data.map((a) => normalizarAnalisis(a))
}

// Competidores reales (guardados por POST /analyses) agrupados por distancia.
// Nota: el back guarda category = nombre del rubro, así que agrupar por
// categoría daría una sola barra; la distancia sí aporta información.
export async function competidoresPorDistancia(analysisId, radius = 500, bandas = 5) {
  const { data } = await api.get(`/competitors/analysis/${analysisId}`)
  const paso = radius / bandas
  const grupos = Array.from({ length: bandas }, (_, i) => ({
    label: `${Math.round(paso * (i + 1))}m`,
    value: 0,
  }))
  for (const c of data) {
    const d = Number(c.distance_m ?? 0)
    const i = Math.min(bandas - 1, Math.floor(d / paso))
    grupos[i].value += 1
  }
  const ratings = data.filter((c) => c.rating).map((c) => Number(c.rating))
  const ratingPromedio = ratings.length
    ? Math.round((ratings.reduce((s, r) => s + r, 0) / ratings.length) * 10) / 10
    : null
  return { total: data.length, grupos, ratingPromedio }
}

// Nombre corto para listas: "Cafetería · Palermo"
export function nombreAnalisis(a) {
  const rubro = a?.motor?.rubro?.nombre || a?.business_name || "Análisis"
  const zona = a?._neighborhood || a?.neighborhood || a?.motor?.zona?.descripcionZona || `#${a?.id}`
  return `${rubro} · ${zona}`
}
