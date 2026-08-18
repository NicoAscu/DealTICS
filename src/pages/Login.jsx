import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import api from "../services/api"

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) { setError("Completá todos los campos."); return }
    setLoading(true)
    setError("")
    try {
      const res = await api.post("/users/login", { email, password })
      localStorage.setItem("token", res.data.token)
      localStorage.setItem("user", JSON.stringify(res.data.user))
      navigate("/")
    } catch (e) {
      setError("Email o contraseña incorrectos.")
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: "100%", padding: "12px 16px", borderRadius: 10,
    border: "1px solid var(--color-border)", background: "var(--color-bg)",
    color: "var(--color-text)", fontSize: 14, outline: "none", marginBottom: 12,
  }

  return (
    <div style={{ minHeight: "calc(100vh - 56px)", background: "var(--color-bg)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 400, background: "var(--color-surface)",
        borderRadius: 16, padding: 36, border: "1px solid var(--color-border)" }}>

        <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--color-text)", marginBottom: 4 }}>
          Iniciar sesión
        </h2>
        <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 28 }}>
          Accedé a tus análisis guardados.
        </p>

        <label style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)",
          letterSpacing: 1, display: "block", marginBottom: 6 }}>EMAIL</label>
        <input type="email" placeholder="tu@email.com" value={email}
          onChange={e => setEmail(e.target.value)} style={inputStyle} />

        <label style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)",
          letterSpacing: 1, display: "block", marginBottom: 6 }}>CONTRASEÑA</label>
        <input type="password" placeholder="••••••••" value={password}
          onChange={e => setPassword(e.target.value)} style={inputStyle}
          onKeyDown={e => e.key === "Enter" && handleLogin()} />

        <div style={{ textAlign: "right", marginBottom: 20 }}>
          <Link to="/recuperar" style={{ fontSize: 12, color: "var(--color-accent)",
            textDecoration: "none" }}>¿Olvidaste tu contraseña?</Link>
        </div>

        {error && (
          <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 8,
            padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>{error}</div>
        )}

        <button onClick={handleLogin} disabled={loading} style={{
          width: "100%", padding: "14px", borderRadius: 10, border: "none",
          background: "var(--color-primary)", color: "var(--color-on-primary)",
          fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1,
        }}>{loading ? "Ingresando..." : "Ingresar"}</button>

        <p style={{ textAlign: "center", fontSize: 13, color: "var(--color-text-muted)", marginTop: 20 }}>
          ¿No tenés cuenta?{" "}
          <Link to="/registro" style={{ color: "var(--color-accent)", textDecoration: "none", fontWeight: 600 }}>
            Registrate
          </Link>
        </p>
      </div>
    </div>
  )
}