import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import RiskBadge from "../components/RiskBadge"

const mockAnalisis = [
  { id: 1, neighborhood: "Palermo, CABA", business_name: "Cafetería", opportunity_index: 78,
    risk_level: "low", radius_m: 500, created_at: "2026-06-15" },
  { id: 2, neighborhood: "Villa Crespo, CABA", business_name: "Kiosco", opportunity_index: 64,
    risk_level: "medium", radius_m: 1000, created_at: "2026-06-20" },
  { id: 3, neighborhood: "Flores, CABA", business_name: "Panadería", opportunity_index: 51,
    risk_level: "high", radius_m: 500, created_at: "2026-06-28" },
]

export default function MisAnalisis() {
  const navigate = useNavigate()
  const [analisis, setAnalisis] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) { navigate("/login"); return }

    const user = JSON.parse(userData)
    api.get(`/analyses/user/${user.id}`)
      .then(r => setAnalisis(r.data))
      .catch(() => setAnalisis(mockAnalisis))
      .finally(() => setLoading(false))
  }, [])

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
        ) : analisis.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
            <p style={{ color: "var(--color-text-muted)" }}>Todavía no hiciste ningún análisis.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {analisis.map(a => {
              const risk = riskConfig[a.risk_level] || riskConfig.medium
              return (
                <div key={a.id} onClick={() => navigate("/resultados")}
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
                        {a.opportunity_index}
                      </span>
                      <span style={{ fontSize: 9, color: "var(--color-text-muted)" }}>/100</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text)" }}>
                        {a.business_name} · {a.neighborhood}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>
                        Radio {a.radius_m}m · {a.created_at}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <RiskBadge level={a.risk_level} size="sm" />
                    <span style={{ color: "var(--color-text-muted)", fontSize: 18 }}>→</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}