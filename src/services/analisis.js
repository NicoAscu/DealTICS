import api from "./api"
import { normalizarAnalisis, agruparPorDistancia, safeParse } from "./normalizar"

export {
  normalizarAnalisis, porcentaje, MAX_SCORES, nombreAnalisis, agruparPorDistancia, categoriaTrends,
} from "./normalizar"

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
export async function crearAnalisis({ lat, lng, radius, businessId, businessName, businessCategory }) {
  const { data: location } = await api.post("/locations", {
    latitude: lat,
    longitude: lng,
    radius_m: radius,
  })
  const { data } = await api.post("/analyses", {
    location_id: location.id,
    business_id: Number(businessId),
  })
  return normalizarAnalisis(data, {
    location, _mapPosition: { lat, lng }, _radius: radius, businessName, businessCategory,
  })
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

// Competidores reales (guardados por POST /analyses) agrupados por distancia
export async function competidoresPorDistancia(analysisId, radius = 500, bandas = 5) {
  const { data } = await api.get(`/competitors/analysis/${analysisId}`)
  return agruparPorDistancia(data, radius, bandas)
}


// Recomendaciones de rubros para la zona del análisis (radio censal o nivel de ingreso)
export async function recomendacionesDeAnalisis(analysisId) {
  const { data } = await api.get(`/recommendations/analysis/${analysisId}`)
  return data
}

// Tendencia de búsquedas (Google Trends) de la categoría del rubro.
// Devuelve la serie si existe; si no, el ranking comparativo de categorías.
export async function tendenciaDeCategoria(categoriaTrends) {
  if (categoriaTrends) {
    try {
      const { data } = await api.get(`/trends/rubros/${categoriaTrends}`)
      if (Array.isArray(data?.datos) && data.datos.length) {
        return {
          tipo: "serie",
          nombre: data.nombre,
          termino: data.terminoUsado,
          tendencia: data.tendencia,
          variacion: data.variacionPct,
          promedio: data.promedioAnual,
          // Las semanas en 0 son huecos de la descarga de Google Trends, no interés nulo
          datos: data.datos.filter((d) => d.valor > 0),
        }
      }
    } catch {
      // sin serie para esta categoría: seguimos con el ranking
    }
  }
  const { data } = await api.get("/trends/comparacion")
  return { tipo: "ranking", ranking: data?.ranking ?? [], conclusion: data?.conclusion }
}
