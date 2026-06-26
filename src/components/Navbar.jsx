import { Link, useLocation } from "react-router-dom"

export default function Navbar() {
  const { pathname } = useLocation()

  const links = [
    { to: "/", label: "Inicio" },
    { to: "/analisis", label: "Análisis" },
    { to: "/comparador", label: "Comparador" },
    { to: "/reportes", label: "Reportes" },
  ]

  return (
    <nav style={{
      background: "var(--color-surface)",
      borderBottom: "1px solid var(--color-border)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 32px",
      height: "56px",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: "var(--color-primary)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <span style={{ color: "white", fontSize: 16 }}>◎</span>
        </div>
        <span style={{ fontWeight: 700, fontSize: 18, color: "var(--color-text)" }}>
          Deal<span style={{ color: "var(--color-accent)" }}>TICS</span>
        </span>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 8,
        background: "var(--color-bg)", borderRadius: 8, padding: "4px 8px" }}>
        <input placeholder="Buscar dirección o coordenadas..."
          style={{
            background: "transparent", border: "none", outline: "none",
            color: "var(--color-text)", fontSize: 14, width: 280,
          }} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        {links.slice(1).map(l => (
          <Link key={l.to} to={l.to} style={{
            textDecoration: "none", fontSize: 14, fontWeight: 500,
            color: pathname === l.to ? "var(--color-text)" : "var(--color-text-muted)",
            borderBottom: pathname === l.to ? "2px solid var(--color-text)" : "2px solid transparent",
            paddingBottom: 2,
          }}>{l.label}</Link>
        ))}
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "var(--color-primary)", color: "white",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 700, cursor: "pointer"
        }}>CR</div>
      </div>
    </nav>
  )
}