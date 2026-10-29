import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import RiskBadge from "./RiskBadge"
import { recomendacionesDeAnalisis, tendenciaDeCategoria, categoriaTrends } from "../services/analisis"

const bloque = { padding: 24, borderBottom: "1px solid var(--color-border)" }
const titulo = { fontSize: 15, fontWeight: 700, color: "var(--color-text)", marginBottom: 4 }
const sub = { fontSize: 12, color: "var(--color-text-muted)", marginBottom: 16 }

function Barra({ label, valor, nota }) {
  const pct = valor == null ? null : Math.round(valor * 100)
  const color = pct == null ? "var(--color-border)" : pct < 33 ? "#22c55e" : pct < 67 ? "#f59e0b" : "#ef4444"
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13,
        color: "var(--color-text)", marginBottom: 4 }}>
        <span>{label} <span style={{ color: "var(--color-text-muted)", fontSize: 11 }}>{nota}</span></span>
        <span style={{ fontWeight: 700 }}>{pct == null ? "s/d" : `${pct}%`}</span>
      </div>
      <div style={{ height: 6, background: "var(--color-border)", borderRadius: 3 }}>
        <div style={{ height: "100%", borderRadius: 3, background: color, width: `${pct ?? 0}%` }} />
      </div>
    </div>
  )
}

// Índice de riesgo comercial con sus 3 componentes (sección 9)
export function DesgloseRiesgo({ riesgo, nivel }) {
  const c = riesgo?.componentes ?? {}
  return (
    <div style={bloque}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
        <h4 style={{ ...titulo, marginBottom: 0 }}>Riesgo comercial</h4>
        <RiskBadge level={nivel} size="sm" />
        {riesgo?.indiceDisplay != null && (
          <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
            índice <strong style={{ color: "var(--color-text)" }}>{riesgo.indiceDisplay}/100</strong>
          </span>
        )}
      </div>
      <p style={sub}>Más alto = más riesgo. Pondera mercado 40%, financiero 35% y demográfico 25%.</p>
      <Barra label="Mercado" nota="saturación de competidores" valor={c.riesgoMercado} />
      <Barra label="Financiero" nota="inversión vs. poder adquisitivo" valor={c.riesgoFinanciero} />
      <Barra label="Demográfico" nota="demanda de la zona" valor={c.riesgoDemografico} />
      {c.riesgoFinanciero == null && (
        <p style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
          El motor de datos no respondió para este análisis: el nivel se calculó solo con la competencia.
        </p>
      )}
    </div>
  )
}

// Tendencia de búsquedas en Google Trends para la categoría del rubro
export function TendenciaConsumo({ categoria }) {
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState(false)
  const clave = categoriaTrends(categoria)

  useEffect(() => {
    tendenciaDeCategoria(clave).then(setDatos).catch(() => setError(true))
  }, [clave])

  if (error) return null
  return (
    <div style={bloque}>
      <h4 style={titulo}>Tendencia de consumo</h4>
      {!datos ? (
        <p style={sub}>Cargando Google Trends...</p>
      ) : datos.tipo === "serie" ? (
        <>
          <p style={sub}>
            Búsquedas de “{datos.termino}” en CABA, últimos 12 meses (Google Trends, 0–100) ·{" "}
            <strong style={{ color: datos.tendencia === "creciendo" ? "#16a34a" : datos.tendencia === "bajando" ? "#dc2626" : "var(--color-text)" }}>
              {datos.tendencia}{datos.variacion != null ? ` (${datos.variacion > 0 ? "+" : ""}${datos.variacion}%)` : ""}
            </strong>
          </p>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={datos.datos}>
              <XAxis dataKey="fecha" tickFormatter={(f) => f.slice(5, 7) + "/" + f.slice(2, 4)}
                stroke="var(--color-text-muted)" fontSize={11} interval={8} />
              <YAxis domain={[0, 100]} stroke="var(--color-text-muted)" fontSize={11} width={28} />
              <Tooltip labelFormatter={(f) => `Semana del ${f}`} formatter={(v) => [v, "interés"]}
                contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }} />
              {datos.promedio != null && <ReferenceLine y={datos.promedio} stroke="var(--color-text-muted)" strokeDasharray="4 4" />}
              <Line type="monotone" dataKey="valor" stroke="#4a7fd4" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </>
      ) : (
        <>
          <p style={sub}>
            {clave
              ? "No hay serie de búsquedas para esta categoría todavía. Interés comparado entre categorías en CABA:"
              : "Interés de búsqueda comparado entre categorías en CABA (Google Trends):"}
          </p>
          {datos.ranking.map((r) => (
            <div key={r.termino} style={{ display: "flex", justifyContent: "space-between",
              fontSize: 13, color: "var(--color-text)", padding: "6px 0",
              borderTop: "1px solid var(--color-border)" }}>
              <span>{r.posicion}. {r.rubro}</span>
              <strong>{r.promedioInteres}</strong>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

// Rubros recomendados para la zona (módulo de recomendaciones del back + alternativas del motor)
export function Recomendaciones({ analysisId, alternativas = [], excluir }) {
  const [recs, setRecs] = useState(null)

  useEffect(() => {
    if (!analysisId) return
    recomendacionesDeAnalisis(analysisId)
      .then((d) => setRecs(d?.recomendaciones ?? []))
      .catch(() => setRecs([]))
  }, [analysisId])

  // Primero las alternativas que calculó el motor para el rubro elegido, después las de la zona
  const vistos = new Set()
  const lista = [...alternativas, ...(recs ?? [])]
    .filter((r) => r?.nombre && r.nombre !== excluir && !vistos.has(r.nombre) && vistos.add(r.nombre))
    .slice(0, 5)

  return (
    <div>
      {lista.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
          {recs == null ? "Cargando recomendaciones..." : "Sin recomendaciones para esta zona."}
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {lista.map((r, i) => (
            <div key={r.nombre} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
              gap: 12, padding: "10px 14px", borderRadius: 10,
              border: "1px solid var(--color-border)",
              background: i === 0 ? "var(--color-bg)" : "transparent" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text)" }}>{r.nombre}</div>
                {(r.inversionMinUSD || r.inversionMaxUSD) && (
                  <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                    Inversión USD {r.inversionMinUSD?.toLocaleString("es-AR")} – {r.inversionMaxUSD?.toLocaleString("es-AR")}
                  </div>
                )}
              </div>
              {r.puntajeCompatibilidad != null && (
                <span style={{ fontSize: 13, fontWeight: 800, color: "var(--color-accent)", whiteSpace: "nowrap" }}>
                  {Math.round(r.puntajeCompatibilidad * 100)}% compatible
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
