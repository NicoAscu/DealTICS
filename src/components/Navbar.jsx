import { Link, useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"

export default function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [dark, setDark] = useState(false)
  const [user, setUser] = useState(null)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

  useEffect(() => {
    const saved = localStorage.getItem("user")
    if (saved) setUser(JSON.parse(saved))
  }, [pathname])

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    navigate("/")
    setShowMenu(false)
  }

  const links = [
    { to: "/analisis", label: "Análisis" },
    { to: "/simulador", label: "Simulador" },
    { to: "/comparador", label: "Comparador" },
    { to: "/reportes", label: "Reportes" },
  ]

  return (
    <nav style={{
      background: "var(--color-surface)",
      borderBottom: "1px solid var(--color-border)",
      display: "flex", alignItems: "center",
      justifyContent: "space-between",
      padding: "0 32px", height: "56px",
      position: "sticky", top: 0, zIndex: 100,
    }}>
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
        <div style={{ width: 32, height: 32, borderRadius: 8,
          background: "var(--color-primary)",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "white", fontSize: 16 }}>◎</span>
        </div>
        <span style={{ fontWeight: 700, fontSize: 18, color: "var(--color-text)" }}>
          Deal<span style={{ color: "var(--color-accent)" }}>TICS</span>
        </span>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 8,
        background: "var(--color-bg)", borderRadius: 8, padding: "4px 8px" }}>
        <input placeholder="Buscar dirección o coordenadas..."
          style={{ background: "transparent", border: "none", outline: "none",
            color: "var(--color-text)", fontSize: 14, width: 280 }} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        {links.map(l => (
          <Link key={l.to} to={l.to} style={{
            textDecoration: "none", fontSize: 14, fontWeight: 500,
            color: pathname === l.to ? "var(--color-text)" : "var(--color-text-muted)",
            borderBottom: pathname === l.to ? "2px solid var(--color-text)" : "2px solid transparent",
            paddingBottom: 2,
          }}>{l.label}</Link>
        ))}

        <button onClick={() => setDark(d => !d)} style={{
          width: 32, height: 32, borderRadius: 8,
          border: "1px solid var(--color-border)",
          background: "var(--color-bg)", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14
        }}>{dark ? "☀️" : "🌙"}</button>

        {user ? (
          <div style={{ position: "relative" }}>
            <div onClick={() => setShowMenu(m => !m)} style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "var(--color-primary)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, color: "var(--color-on-primary)"
            }}>
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            {showMenu && (
              <div style={{ position: "absolute", right: 0, top: 40,
                background: "var(--color-surface)", border: "1px solid var(--color-border)",
                borderRadius: 10, padding: 8, minWidth: 160, zIndex: 200 }}>
                <div style={{ padding: "8px 12px", fontSize: 13,
                  color: "var(--color-text-muted)", borderBottom: "1px solid var(--color-border)",
                  marginBottom: 4 }}>{user.name || user.email}</div>
                <div onClick={() => { navigate("/mis-analisis"); setShowMenu(false) }}
                  style={{ padding: "8px 12px", fontSize: 14, color: "var(--color-text)",
                    cursor: "pointer", borderRadius: 6 }}>Mis análisis</div>
                <div onClick={logout}
                  style={{ padding: "8px 12px", fontSize: 14, color: "#ef4444",
                    cursor: "pointer", borderRadius: 6 }}>Cerrar sesión</div>
              </div>
            )}
          </div>
        ) : (
          <button onClick={() => navigate("/login")} style={{
            background: "var(--color-primary)", color: "var(--color-on-primary)",
            border: "none", borderRadius: 8, padding: "7px 16px",
            fontSize: 13, fontWeight: 700, cursor: "pointer"
          }}>Ingresar</button>
        )}
      </div>
    </nav>
  )
}