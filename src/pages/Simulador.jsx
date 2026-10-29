import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { mensajeError, isLoggedIn } from "../services/api"
import { leerAnalisisActual, nombreAnalisis } from "../services/analisis"
import {
  CAMPOS_INICIALES, CAMPOS_MENSUALES, CAMPOS_COMERCIALES,
  escenarioPorDefecto, calcularMetricas, formatear,
} from "../services/finanzas"
import {
  cargarDelBackend, guardarEnBackend, leerEscenariosLocales, guardarEscenariosLocales,
} from "../services/escenarios"
import SimuladorDashboard from "../components/SimuladorDashboard"
import ComparacionEscenarios from "../components/ComparacionEscenarios"

const seccionTitulo = {
  fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)",
  letterSpacing: 1, marginBottom: 10, marginTop: 20,
}

// Campo de dinero compacto: etiqueta + input numérico
function CampoDinero({ label, value, onChange, hint }) {
  return (
    <label style={{ display: "block", marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13,
        color: "var(--color-text)", marginBottom: 4 }}>
        <span>{label}</span>
      </div>
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: 12, top: 9, fontSize: 13, color: "var(--color-text-muted)" }}>$</span>
        <input type="number" min={0} value={value}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
          style={{
            width: "100%", padding: "8px 12px 8px 24px", borderRadius: 8,
            border: "1px solid var(--color-border)", background: "var(--color-bg)",
            color: "var(--color-text)", fontSize: 13, outline: "none",
          }} />
      </div>
      {hint}
    </label>
  )
}

function Slider({ label, value, onChange, min, max, step, prefix = "", suffix = "" }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, gap: 8 }}>
        <label style={{ fontSize: 13, color: "var(--color-text)" }}>{label}</label>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-accent)", whiteSpace: "nowrap" }}>
          {prefix}{Number(value).toLocaleString("es-AR")}{suffix}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "var(--color-accent)" }} />
    </div>
  )
}

export default function Simulador() {
  const navigate = useNavigate()
  const analisis = useMemo(() => leerAnalisisActual(), [])
  const analysisId = analisis?.id ?? null

  // Estado: escenario A siempre; B solo si el usuario activa la comparación
  const inicial = leerEscenariosLocales(analysisId)
  const [escenarios, setEscenarios] = useState(() => ({
    A: inicial?.A ?? escenarioPorDefecto(),
    B: inicial?.B ?? null,
  }))
  const [activo, setActivo] = useState("A")
  const [existentes, setExistentes] = useState([])     // escenarios ya guardados en el back
  const [estimacionBack, setEstimacionBack] = useState(null) // alquiler estimado por el sistema
  const [guardado, setGuardado] = useState(null)
  const [guardando, setGuardando] = useState(false)

  // Traer lo guardado en el back para este análisis
  useEffect(() => {
    if (!analysisId || !isLoggedIn()) return
    cargarDelBackend(analysisId)
      .then(({ costos, escenarios: lista, A, B }) => {
        setExistentes(lista)
        if (costos) setEstimacionBack({ alquiler: Number(costos.rent_monthly_est), m2: Number(costos.estimated_local_size) })
        // Lo local tiene prioridad (incluye los costos propios de B); si no hay, usamos el back
        if (!inicial && (A || B)) setEscenarios({ A: A ?? escenarioPorDefecto(), B })
      })
      .catch(() => {})
  }, [analysisId])

  useEffect(() => { guardarEscenariosLocales(analysisId, escenarios) }, [analysisId, escenarios])

  const actual = escenarios[activo] ?? escenarios.A
  const set = (key) => (valor) =>
    setEscenarios((prev) => ({ ...prev, [activo]: { ...prev[activo], [key]: valor } }))

  const metricas = useMemo(() => calcularMetricas(actual), [actual])
  const comparando = Boolean(escenarios.B)

  const activarComparacion = () => {
    setEscenarios((prev) => ({ ...prev, B: { ...prev.A } }))
    setActivo("B")
  }
  const quitarB = () => {
    setEscenarios((prev) => ({ ...prev, B: null }))
    setActivo("A")
  }

  const handleGuardar = async () => {
    if (!analysisId) {
      setGuardado({ ok: false, texto: "Primero hacé un análisis de zona para asociarle los escenarios." })
      return
    }
    if (!isLoggedIn()) { navigate("/login?next=/simulador"); return }
    setGuardando(true)
    setGuardado(null)
    try {
      const { estimacion, escenarios: lista } = await guardarEnBackend(analysisId, escenarios, existentes)
      setExistentes(lista)
      if (estimacion?.rent_monthly_est != null) {
        setEstimacionBack({ alquiler: Number(estimacion.rent_monthly_est), m2: Number(estimacion.estimated_local_size) })
      }
      setGuardado({
        ok: true,
        texto: comparando ? "Escenarios A y B guardados en tu análisis." : "Escenario guardado en tu análisis.",
        advertencia: estimacion?.advertencia || null,
      })
    } catch (e) {
      setGuardado({ ok: false, texto: mensajeError(e, "No se pudo guardar.") })
    } finally {
      setGuardando(false)
    }
  }

  const hintAlquiler = estimacionBack?.alquiler > 0 && (
    <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 4 }}>
      Estimación del sistema para esta zona: <strong>{formatear(estimacionBack.alquiler, "dinero")}</strong>
      {estimacionBack.m2 ? ` (${estimacionBack.m2} m²)` : ""}{" · "}
      <button type="button" onClick={() => set("alquiler")(estimacionBack.alquiler)} style={{
        background: "none", border: "none", padding: 0, color: "var(--color-accent)",
        cursor: "pointer", fontSize: 11, textDecoration: "underline",
      }}>usar</button>
    </div>
  )

  const tabStyle = (on) => ({
    flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer",
    border: "1px solid var(--color-border)",
    background: on ? "var(--color-primary)" : "transparent",
    color: on ? "var(--color-on-primary)" : "var(--color-text)",
  })

  return (
    <div className="page-enter layout-split" style={{ display: "flex", minHeight: "calc(100vh - 56px)", background: "var(--color-bg)" }}>

      {/* Panel izquierdo: datos del escenario */}
      <div className="panel-lateral" style={{ width: 380, minWidth: 320, flexShrink: 0, background: "var(--color-surface)", margin: 16,
        borderRadius: 16, padding: 24, border: "1px solid var(--color-border)", height: "fit-content" }}>

        <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--color-text)", marginBottom: 4 }}>
          Simulador financiero
        </h2>
        <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 12 }}>
          Valores en <strong>pesos argentinos (ARS)</strong>.{" "}
          {analisis ? <>Análisis: <strong>{nombreAnalisis(analisis)}</strong>.</> : "Sin análisis de zona asociado."}
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
          <button type="button" style={tabStyle(activo === "A")} onClick={() => setActivo("A")}>Escenario A</button>
          {comparando
            ? <button type="button" style={tabStyle(activo === "B")} onClick={() => setActivo("B")}>Escenario B</button>
            : <button type="button" style={tabStyle(false)} onClick={activarComparacion}>+ Comparar con B</button>}
        </div>
        {comparando && (
          <button type="button" onClick={quitarB} style={{
            background: "none", border: "none", padding: 0, fontSize: 12,
            color: "var(--color-text-muted)", cursor: "pointer", textDecoration: "underline",
          }}>Quitar escenario B</button>
        )}

        <div style={seccionTitulo}>INVERSIÓN INICIAL</div>
        {CAMPOS_INICIALES.map((c) => (
          <CampoDinero key={c.key} label={c.label} value={actual[c.key]} onChange={set(c.key)} />
        ))}
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text)", textAlign: "right" }}>
          Total: {formatear(metricas.inversionInicial, "dinero")}
        </div>

        <div style={seccionTitulo}>COSTOS MENSUALES</div>
        {CAMPOS_MENSUALES.map((c) => (
          <CampoDinero key={c.key} label={c.label} value={actual[c.key]} onChange={set(c.key)}
            hint={c.key === "alquiler" ? hintAlquiler : null} />
        ))}
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text)", textAlign: "right" }}>
          Total: {formatear(metricas.costosMensuales, "dinero")}
        </div>

        <div style={seccionTitulo}>VARIABLES COMERCIALES</div>
        {CAMPOS_COMERCIALES.map((c) => (
          <Slider key={c.key} label={c.label} value={actual[c.key]} onChange={set(c.key)}
            min={c.min} max={c.max} step={c.step} prefix={c.prefix} suffix={c.suffix} />
        ))}

        <button onClick={handleGuardar} disabled={guardando} style={{
          width: "100%", padding: 14, borderRadius: 12, fontSize: 15,
          fontWeight: 700, cursor: "pointer", border: "none",
          background: "var(--color-primary)", color: "var(--color-on-primary)",
          marginTop: 8, opacity: guardando ? 0.7 : 1,
        }}>{guardando ? "Guardando..." : comparando ? "Guardar escenarios" : "Guardar escenario"}</button>
        {guardado && (
          <div style={{ fontSize: 12, marginTop: 10 }}>
            <p style={{ color: guardado.ok ? "#16a34a" : "#dc2626" }}>{guardado.texto}</p>
            {guardado.advertencia && <p style={{ color: "#b45309", marginTop: 4 }}>{guardado.advertencia}</p>}
          </div>
        )}
      </div>

      {/* Panel derecho: resultados */}
      <div style={{ flex: 1, padding: 16, minWidth: 0 }}>
        {comparando && (
          <>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text)", margin: "4px 0 12px" }}>
              Comparación de escenarios
            </h3>
            <ComparacionEscenarios A={escenarios.A} B={escenarios.B} />
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text)", margin: "8px 0 12px" }}>
              Detalle del escenario {activo}
            </h3>
          </>
        )}
        <SimuladorDashboard metricas={metricas} />
      </div>
    </div>
  )
}
