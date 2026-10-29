import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import RiskBadge from "../components/RiskBadge"
import { getUser, mensajeError } from "../services/api"
import {
  listarHistorial, cargarAnalisis, guardarAnalisisActual, nombreAnalisis,
} from "../services/analisis"

export default function MisAnalisis() {
  const navigate = useNavigate()
  const [analisis, setAnalisis] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [abriendo, setAbriendo] = useState(null)

  useEffect(() => {
    const user = getUser()
    if (!user?.id) { navigate("/login?next=/mis-analisis"); return }

    listarHistorial(user.id)
      .then(setAnalisis)
      .catch(e => setError(mensajeError(e, "No se pudo cargar el historial.")))
      .finally(() => setLoading(false))
  }, [])

  const handleAbrir = async (a) => {
    setAbriendo(a.id)
    try {
      // GET /analyses/:id trae location_id; con eso buscamos la ubicación para el mapa
      guardarAnalisisActual(await cargarAnalisis(a.id))
    } catch {
      // Igual tenemos los datos del historial (incluye motor_analisis), sin mapa
      guardarAnalisisActual(a)
    }
    navigate("/resultados")
  }

  const formatFecha = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })
  }


  return (
    <div className="page-enter" style={{ minHeight: "calc(100vh - 56px)", background: "var(--color-bg)", padding: 32 }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 28 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--color-text)", marginBottom: 4 }}>
              Mis análisis
            </h2>
            <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
              Historial de zonas analizadas.
            </p>
          </div>
          <button onClick={() => navigate("/analisis")} style={{
            background: "var(--color-primary)", color: "var(--color-on-primary)",
            border: "none", borderRadius: 10, padding: "12px 20px",
            fontSize: 14, fontWeight: 700, cursor: "pointer"
          }}>+ Nuevo análisis</button>
        </div>

        {loading ? (
          <p style={{ color: "var(--color-text-muted)", textAlign: "center" }}>Cargando...</p>
        ) : error ? (
          <p style={{ color: "#dc2626", textAlign: "center" }}>{error}</p>
        ) : analisis.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
            <p style={{ color: "var(--color-text-muted)" }}>Todavía no hiciste ningún análisis.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {analisis.map(a => (
              <div key={a.id} onClick={() => handleAbrir(a)}
                className="card-hover"
                style={{ background: "var(--color-surface)", borderRadius: 14,
                  border: "1px solid var(--color-border)", padding: "20px 24px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 12,
                    background: "var(--color-bg)", display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text)" }}>
                      {parseFloat(a.opportunity_index).toFixed(0)}
                    </span>
                    <span style={{ fontSize: 9, color: "var(--color-text-muted)" }}>/100</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text)" }}>
                      {nombreAnalisis(a)}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>
                      {a.radius_m ? `Radio ${a.radius_m}m · ` : ""}{formatFecha(a.created_at)}{abriendo === a.id ? " · abriendo..." : ""}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <RiskBadge level={a.risk_level} size="sm" />
                  <span style={{ color: "var(--color-text-muted)", fontSize: 18 }}>→</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}