// ─────────────────────────────────────────────────────────────
// Normalización de análisis: funciones puras (sin axios) para poder
// testearlas con `npm test`. services/analisis.js las re-exporta.
// ─────────────────────────────────────────────────────────────

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

export function safeParse(s) {
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
    _businessCategory: extras.businessCategory ?? raw._businessCategory ?? raw.business_category ?? null,
    business_name: raw.business_name ?? extras.businessName ?? null,
  }
}

// Porcentaje 0-100 de un componente del breakdown, o null si no hay dato
export function porcentaje(breakdown, key) {
  const score = breakdown?.[key]?.score
  if (score == null) return null
  return Math.round((Number(score) / MAX_SCORES[key]) * 100)
}

// Competidores agrupados en bandas de distancia.
// Nota: el back guarda category = nombre del rubro, así que agrupar por
// categoría daría una sola barra; la distancia sí aporta información.
export function agruparPorDistancia(competidores, radius = 500, bandas = 5) {
  const paso = radius / bandas
  const grupos = Array.from({ length: bandas }, (_, i) => ({
    label: `${Math.round(paso * (i + 1))}m`,
    value: 0,
  }))
  for (const c of competidores) {
    const d = Number(c.distance_m ?? 0)
    const i = Math.min(bandas - 1, Math.floor(d / paso))
    grupos[i].value += 1
  }
  const ratings = competidores.filter((c) => c.rating).map((c) => Number(c.rating))
  const ratingPromedio = ratings.length
    ? Math.round((ratings.reduce((s, r) => s + r, 0) / ratings.length) * 10) / 10
    : null
  return { total: competidores.length, grupos, ratingPromedio }
}

// Categoría de Google Trends (data/trends_dealtics.json) para la categoría del rubro
const TRENDS_POR_CATEGORIA = {
  gastronomia: "gastronomia", alimentos: "gastronomia",
  retail: "comercio", comercio: "comercio",
  estetica: "estetica",
}
export function categoriaTrends(categoria) {
  const clave = String(categoria || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
  return TRENDS_POR_CATEGORIA[clave] || null
}

// Nombre corto para listas: "Cafetería · Palermo"
export function nombreAnalisis(a) {
  const rubro = a?.motor?.rubro?.nombre || a?.business_name || "Análisis"
  const zona = a?._neighborhood || a?.neighborhood || a?.motor?.zona?.descripcionZona || `#${a?.id}`
  return `${rubro} · ${zona}`
}
