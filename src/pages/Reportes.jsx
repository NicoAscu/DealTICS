export default function Reportes() {
    return (
      <div style={{ minHeight: "calc(100vh - 56px)", background: "var(--color-bg)",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}></div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--color-text)", marginBottom: 8 }}>
        </h2>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", textAlign: "center", maxWidth: 360 }}>
        </p>
      </div>
    )
  }