import axios from "axios"

// ─────────────────────────────────────────────────────────────
// Único punto de contacto con el backend.
// - Manda el JWT en cada request (el back lo exige en casi todas las rutas).
// - Timeout largo: Render "despierta" en 30-60 s y POST /analyses
//   corre el motor Python (hasta 20 s) + Google Places.
// - Reintenta UNA vez los GET que fallan por red/timeout (arranque en frío).
// - Si el token venció (401), limpia la sesión y manda al login.
// ─────────────────────────────────────────────────────────────

const TOKEN_KEY = "token"
const USER_KEY = "user"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  timeout: 90000,
})

// ── Sesión ────────────────────────────────────────────────────
export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    const user = raw ? JSON.parse(raw) : null
    // Sesiones viejas guardaban { user, token } entero como "user"
    return user?.user ?? user
  } catch {
    return null
  }
}

export function saveSession({ user, token }) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  window.dispatchEvent(new Event("auth-change"))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem("analysisResult")
  window.dispatchEvent(new Event("auth-change"))
}

export function isLoggedIn() {
  return Boolean(getToken() && getUser()?.id)
}

// ── Interceptores ────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const config = error.config || {}
    const status = error.response?.status

    // Arranque en frío de Render: reintentar una vez los GET sin respuesta
    const sinRespuesta = !error.response && error.code !== "ECONNABORTED"
    if (sinRespuesta && config.method === "get" && !config._reintentado) {
      config._reintentado = true
      return api(config)
    }

    // Token vencido o inválido (no aplica al propio login)
    if (status === 401 && !config.url?.includes("/users/login")) {
      clearSession()
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login?expirada=1")
      }
    }

    return Promise.reject(error)
  }
)

// ── Mensajes de error legibles ───────────────────────────────
export function mensajeError(error, porDefecto = "Ocurrió un error. Intentá de nuevo.") {
  if (!error?.response) {
    if (error?.code === "ECONNABORTED") {
      return "El servidor tardó demasiado en responder. Puede estar iniciando: probá de nuevo en unos segundos."
    }
    return "No se pudo conectar con el servidor. Revisá tu conexión o probá en unos segundos."
  }
  const { status, data } = error.response
  if (status === 429) return data?.error || "Demasiadas solicitudes. Esperá unos minutos."
  if (data?.detalles?.length) return data.detalles.join(". ")
  return data?.error || porDefecto
}

export default api
