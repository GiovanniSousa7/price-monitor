import PriceChart from "@/components/PriceChart";
import { getProductStats, getProductHistory } from "@/lib/api";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function getProductTrend(id) {
  try {
    const res = await fetch(`${API_URL}/api/v1/products/${id}/trend`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

const trendConfig = {
  up:                { label: "📈 Tendência de Alta",   color: "#dc2626", bg: "#fef2f2" },
  down:              { label: "📉 Tendência de Queda",  color: "#16a34a", bg: "#f0fdf4" },
  stable:            { label: "➡️ Preço Estável",       color: "#6b7280", bg: "#f3f4f6" },
  insufficient_data: { label: "⏳ Dados insuficientes", color: "#d97706", bg: "#fffbeb" },
};

export default async function ProductPage({ params }) {
  const { id } = await params;

  const [stats, history, trend] = await Promise.all([
    getProductStats(id),
    getProductHistory(id),
    getProductTrend(id),
  ]);

  const trendInfo = trend ? trendConfig[trend.trend] : null;

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-main)", fontFamily: "system-ui, sans-serif", transition: "background-color 0.2s" }}>

      {/* Header */}
      <header style={{ backgroundColor: "var(--bg-card)", borderBottom: "1px solid var(--border)", padding: "14px 32px", display: "flex", alignItems: "center", gap: "16px", position: "sticky", top: 0, zIndex: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", transition: "background-color 0.2s" }}>
        <Link href="/" style={{ fontSize: "13px", color: "#2563eb", display: "flex", alignItems: "center", gap: "4px" }}>
          ← Voltar
        </Link>
        <div style={{ width: "1px", height: "20px", backgroundColor: "var(--border)" }}></div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "28px", height: "28px", backgroundColor: "#2563eb", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold", fontSize: "13px" }}>P</div>
          <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>Price Monitor</span>
        </div>
      </header>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "36px 24px" }}>

        {/* Título */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "28px" }}>
          <div>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>Detalhe do Produto</p>
            <h1 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)", lineHeight: 1.3 }}>{stats.product_title}</h1>
          </div>
          {trendInfo && (
            <span style={{ fontSize: "12px", fontWeight: "600", padding: "6px 14px", borderRadius: "20px", backgroundColor: trendInfo.bg, color: trendInfo.color, whiteSpace: "nowrap", flexShrink: 0 }}>
              {trendInfo.label} {trend?.change_pct !== 0 ? `(${trend.change_pct}%)` : ""}
            </span>
          )}
        </div>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "24px" }}>
          {[
            { label: "Menor Preço", value: `$${stats.min_price}`, color: "#16a34a", bg: "#f0fdf4" },
            { label: "Maior Preço", value: `$${stats.max_price}`, color: "#dc2626", bg: "#fef2f2" },
            { label: "Preço Médio", value: `$${stats.avg_price}`, color: "#2563eb", bg: "#eff6ff" },
            { label: "Coletas",     value: stats.total_records,   color: "#374151", bg: "#f9fafb" },
          ].map((s) => (
            <div key={s.label} style={{ backgroundColor: "var(--bg-card)", borderRadius: "12px", padding: "16px", textAlign: "center", boxShadow: "var(--shadow)", border: "1px solid var(--border)", transition: "background-color 0.2s" }}>
              <p style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>{s.label}</p>
              <p style={{ fontSize: "20px", fontWeight: "700", color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Gráfico */}
        <div style={{ backgroundColor: "var(--bg-card)", borderRadius: "14px", padding: "24px", boxShadow: "var(--shadow)", border: "1px solid var(--border)", marginBottom: "20px", transition: "background-color 0.2s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Histórico de Preços</h2>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{history.length} registros</span>
          </div>
          {history.length > 1 ? (
            <PriceChart history={history} />
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "120px", color: "var(--text-muted)", fontSize: "13px" }}>
              Aguardando mais coletas para exibir o gráfico
            </div>
          )}
        </div>

        {/* Tabela */}
        <div style={{ backgroundColor: "var(--bg-card)", borderRadius: "14px", padding: "24px", boxShadow: "var(--shadow)", border: "1px solid var(--border)", transition: "background-color 0.2s" }}>
          <h2 style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "16px" }}>
            Registros de Coleta
          </h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr>
                {["Data", "Preço", "Desconto"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 0", color: "var(--text-muted)", fontWeight: "600", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "2px solid var(--border)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((record, i) => (
                <tr key={record.id} style={{ backgroundColor: i === 0 ? "var(--bg-card-hover)" : "transparent" }}>
                  <td style={{ padding: "11px 0", color: "var(--text-secondary)", borderBottom: "1px solid var(--border)" }}>
                    {new Date(record.collected_at).toLocaleString("pt-BR")}
                  </td>
                  <td style={{ padding: "11px 0", fontWeight: "600", color: "var(--text-primary)", borderBottom: "1px solid var(--border)" }}>
                    ${record.price}
                  </td>
                  <td style={{ padding: "11px 0", borderBottom: "1px solid var(--border)" }}>
                    {record.discount_percentage > 0
                      ? <span style={{ color: "#16a34a", backgroundColor: "#f0fdf4", padding: "2px 8px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" }}>-{record.discount_percentage}%</span>
                      : <span style={{ color: "var(--text-muted)" }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </main>
  );
}