import { useState } from "react"
import { Link } from "react-router-dom"

export default function Recuperar() {
  const [email, setEmail] = useState("")
  const [enviado, setEnviado] = useState(false)

  return (
    <div style={{ minHeight: "calc(100vh - 56px)", background: "var(--color-bg)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 400, background: "var(--color-surface)",
        borderRadius: 16, padding: 36, border: "1px solid var(--color-border)" }}>

        {!enviado ? (
          <>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--color-text)", marginBottom: 4 }}>
              Recuperar contraseña
            </h2>
            <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 28 }}>
              Te mandamos un link para restablecer tu contraseña.
            </p>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)",
              letterSpacing: 1, display: "block", marginBottom: 6 }}>EMAIL</label>
            <input type="email" placeholder="tu@email.com" value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: "100%", padding: "12px 16px", borderRadius: 10,
                border: "1px solid var(--color-border)", background: "var(--color-bg)",
                color: "var(--color-text)", fontSize: 14, outline: "none", marginBottom: 20 }} />
            <button onClick={() => email && setEnviado(true)} style={{
              width: "100%", padding: "14px", borderRadius: 10, border: "none",
              background: "var(--color-primary)", color: "var(--color-on-primary)",
              fontSize: 15, fontWeight: 700, cursor: "pointer",
            }}>Enviar link</button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 48, textAlign: "center", marginBottom: 16 }}>📧</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--color-text)",
              textAlign: "center", marginBottom: 8 }}>Revisá tu email</h2>
            <p style={{ fontSize: 13, color: "var(--color-text-muted)", textAlign: "center" }}>
              Te mandamos un link a <strong>{email}</strong> para restablecer tu contraseña.
            </p>
          </>
        )}

        <p style={{ textAlign: "center", fontSize: 13, color: "var(--color-text-muted)", marginTop: 24 }}>
          <Link to="/login" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
            ← Volver al login
          </Link>
        </p>
      </div>
    </div>
  )
}