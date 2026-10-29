import { Link } from "react-router-dom"

// La recuperación por email necesita un endpoint en el back (generar token +
// enviar mail) que todavía no existe. Hasta entonces, esta pantalla lo dice
// en lugar de simular un envío que no ocurre.
export default function Recuperar() {
  return (
    <div style={{ minHeight: "calc(100vh - 56px)", background: "var(--color-bg)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 400, background: "var(--color-surface)",
        borderRadius: 16, padding: 36, border: "1px solid var(--color-border)" }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--color-text)", marginBottom: 8 }}>
          Recuperar contraseña
        </h2>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.5 }}>
          La recuperación por email todavía no está disponible. Si no podés entrar,
          creá una cuenta nueva o pedile al equipo de DealTICS que restablezca tu contraseña.
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <Link to="/login" style={{ flex: 1, textAlign: "center", padding: 12, borderRadius: 10,
            border: "1px solid var(--color-border)", color: "var(--color-text)", textDecoration: "none",
            fontSize: 14 }}>Volver al login</Link>
          <Link to="/registro" style={{ flex: 1, textAlign: "center", padding: 12, borderRadius: 10,
            background: "var(--color-primary)", color: "var(--color-on-primary)", textDecoration: "none",
            fontSize: 14, fontWeight: 700 }}>Crear cuenta</Link>
        </div>
      </div>
    </div>
  )
}
