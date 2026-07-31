const config = {
  low:    { label: "BAJO",  color: "#22c55e", bg: "#dcfce7", icon: "↓" },
  medium: { label: "MEDIO", color: "#f59e0b", bg: "#fef3c7", icon: "→" },
  high:   { label: "ALTO",  color: "#ef4444", bg: "#fee2e2", icon: "↑" },
}

export default function RiskBadge({ level = "medium", size = "md" }) {
  const c = config[level] || config.medium
  const sizes = {
    sm: { fontSize: 10, padding: "3px 10px", gap: 4 },
    md: { fontSize: 12, padding: "5px 14px", gap: 6 },
    lg: { fontSize: 14, padding: "8px 18px", gap: 8 },
  }
  const s = sizes[size]

  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: s.gap,
      background: c.bg, color: c.color, borderRadius: 20,
      padding: s.padding, fontSize: s.fontSize, fontWeight: 700,
    }}>
      <span style={{ fontSize: s.fontSize + 2 }}>{c.icon}</span>
      Riesgo {c.label}
    </div>
  )
}