import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import api from "../services/api"

export default function Registro() {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRegistro = async () => {
    if (!nombre || !email || !password || !confirm) { setError("Completá todos los campos."); return }
    if (password !== confirm) { setError("Las contraseñas no coinciden."); return }
    if (password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); return }
    setLoading(true)
    setError("")
    try {
      const res = await api.post("/users/register", { name: nombre, email, password })
      localStorage.setItem("token", res.data.token)
      localStorage.setItem("user", JSON.stringify(res.data.user))
      navigate("/")
    } catch (e) {
      setError("No se pudo crear la cuenta. El email puede estar en uso.")
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
          Crear cuenta
        </h2>
        <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 28 }}>
          Guardá tus análisis y accedé desde cualquier lugar.
        </p>

        {[
          { label: "NOMBRE", value: nombre, set: setNombre, type: "text", placeholder: "Tu nombre" },
          { label: "EMAIL", value: email, set: setEmail, type: "email", placeholder: "tu@email.com" },
          { label: "CONTRASEÑA", value: password, set: setPassword, type: "password", placeholder: "Mínimo 6 caracteres" },
          { label: "CONFIRMAR CONTRASEÑA", value: confirm, set: setConfirm, type: "password", placeholder: "Repetí tu contraseña" },
        ].map(f => (
          <div key={f.label}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)",
              letterSpacing: 1, display: "block", marginBottom: 6 }}>{f.label}</label>
            <input type={f.type} placeholder={f.placeholder} value={f.value}
              onChange={e => f.set(e.target.value)} style={inputStyle} />
          </div>
        ))}

        {error && (
          <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 8,
            padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>{error}</div>
        )}

        <button onClick={handleRegistro} disabled={loading} style={{
          width: "100%", padding: "14px", borderRadius: 10, border: "none",
          background: "var(--color-primary)", color: "var(--color-on-primary)",
          fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1, marginTop: 4,
        }}>{loading ? "Creando cuenta..." : "Crear cuenta"}</button>

        <p style={{ textAlign: "center", fontSize: 13, color: "var(--color-text-muted)", marginTop: 20 }}>
          ¿Ya tenés cuenta?{" "}
          <Link to="/login" style={{ color: "var(--color-accent)", textDecoration: "none", fontWeight: 600 }}>
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  )
}