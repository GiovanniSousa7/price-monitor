import ProductCard from "@/components/ProductCard";
import ThemeToggle from "@/components/ThemeToggle";
import { getProducts, getDashboardSummary } from "@/lib/api";
import Link from "next/link";

const marketTrendConfig = {
  deflation: { label: "📉 Mercado em queda — bom momento para comprar", color: "#16a34a", bg: "#f0fdf4" },
  inflation: { label: "📈 Mercado em alta — preços subindo", color: "#dc2626", bg: "#fef2f2" },
  stable: { label: "➡️ Mercado estável", color: "#6b7280", bg: "#f3f4f6" },
};

export default async function Home() {
  let products = [];
  let summary = null;

  try {
    [products, summary] = await Promise.all([getProducts(), getDashboardSummary()]);
  } catch (e) {
    console.error(e);
  }

  const kpis = summary?.kpis;
  const marketTrend = kpis ? marketTrendConfig[kpis.market_trend] : null;

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-main)", transition: "background-color 0.2s" }}>

      {/* Header */}
      <header style={{ backgroundColor: "var(--bg-card)", borderBottom: "1px solid var(--border)", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", transition: "background-color 0.2s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "36px", height: "36px", backgroundColor: "#2563eb", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold", fontSize: "16px" }}>P</div>
          <div>
            <h1 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)", lineHeight: 1 }}>Price Monitor</h1>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "3px" }}>Painel de monitoramento de preços</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", backgroundColor: "#22c55e", borderRadius: "50%", display: "inline-block" }}></span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Sistema ativo</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>

        {/* Tendência geral do mercado */}
        {marketTrend && (
          <div style={{ backgroundColor: marketTrend.bg, border: `1px solid ${marketTrend.color}30`, borderRadius: "12px", padding: "14px 20px", marginBottom: "28px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "14px", fontWeight: "600", color: marketTrend.color }}>
              {marketTrend.label}
            </span>
            <span style={{ fontSize: "12px", color: marketTrend.color, opacity: 0.8 }}>
              · {kpis.products_dropping} produtos em queda, {kpis.products_rising} em alta, {kpis.products_stable} estáveis
            </span>
          </div>
        )}

        {/* KPIs principais */}
        {kpis && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px", marginBottom: "28px" }}>
            {[
              { icon: "📦", label: "Produtos Monitorados", value: kpis.total_products, color: "#2563eb", bg: "#eff6ff" },
              { icon: "📋", label: "Total de Coletas", value: kpis.total_records, color: "#7c3aed", bg: "#f5f3ff" },
              { icon: "🏷️", label: "Desconto Médio", value: `${kpis.avg_discount}%`, color: "#16a34a", bg: "#f0fdf4" },
              { icon: "📉", label: "Em Queda", value: kpis.products_dropping, color: "#16a34a", bg: "#f0fdf4" },
              { icon: "📈", label: "Em Alta", value: kpis.products_rising, color: "#dc2626", bg: "#fef2f2" },
            ].map((k) => (
              <div key={k.label} style={{ backgroundColor: "var(--bg-card)", borderRadius: "12px", padding: "18px 16px", boxShadow: "var(--shadow)", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "12px", transition: "background-color 0.2s" }}>
                <div style={{ width: "40px", height: "40px", backgroundColor: k.bg, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
                  {k.icon}
                </div>
                <div>
                  <p style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{k.label}</p>
                  <p style={{ fontSize: "20px", fontWeight: "700", color: k.color, marginTop: "2px" }}>{k.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Linha: Oportunidades + Categorias */}
        {summary && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "28px" }}>

            {/* Oportunidades do momento */}
            <div style={{ backgroundColor: "var(--bg-card)", borderRadius: "14px", padding: "20px", boxShadow: "var(--shadow)", border: "1px solid var(--border)", borderLeft: "4px solid #22c55e", transition: "background-color 0.2s" }}>
              <h3 style={{ fontSize: "12px", fontWeight: "700", color: "#15803d", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
                🎯 Melhores Oportunidades Agora
              </h3>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "16px" }}>
                Produtos com queda recente e desconto alto
              </p>
              {summary.opportunities.length === 0 ? (
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Nenhuma oportunidade identificada no momento.</p>
              ) : summary.opportunities.map((p) => (
                <Link href={`/products/${p.id}`} key={p.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 8px", borderBottom: "1px solid var(--border)", cursor: "pointer" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title.substring(0, 35)}...</p>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                        ${p.current_price} · desconto atual: {p.discount_percentage}%
                      </p>
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "#16a34a", backgroundColor: "#f0fdf4", padding: "4px 10px", borderRadius: "20px", flexShrink: 0, marginLeft: "12px" }}>
                      {p.variation_pct}%
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Distribuição por categoria */}
            <div style={{ backgroundColor: "var(--bg-card)", borderRadius: "14px", padding: "20px", boxShadow: "var(--shadow)", border: "1px solid var(--border)", transition: "background-color 0.2s" }}>
              <h3 style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
                📊 Categorias Monitoradas
              </h3>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "16px" }}>
                Preço médio atual por categoria
              </p>
              {summary.categories.map((c, i) => {
                const maxTotal = summary.categories[0]?.total || 1;
                const barWidth = `${(c.total / maxTotal) * 100}%`;
                return (
                  <div key={c.category} style={{ marginBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: "500", textTransform: "capitalize" }}>{c.category?.replace(/-/g, " ")}</span>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{c.total} produtos · ${c.avg_price}</span>
                    </div>
                    <div style={{ backgroundColor: "var(--border)", borderRadius: "4px", height: "6px" }}>
                      <div style={{ backgroundColor: "#2563eb", borderRadius: "4px", height: "6px", width: barWidth, transition: "width 0.3s" }}></div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* Linha: Maiores quedas + Maiores altas */}
        {summary && summary.biggest_drops.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: summary.biggest_rises.length > 0 ? "1fr 1fr" : "1fr", gap: "16px", marginBottom: "28px" }}>

            <div style={{ backgroundColor: "var(--bg-card)", borderRadius: "14px", padding: "20px", boxShadow: "var(--shadow)", border: "1px solid var(--border)", borderLeft: "4px solid #22c55e", transition: "background-color 0.2s" }}>
              <h3 style={{ fontSize: "12px", fontWeight: "700", color: "#15803d", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "16px" }}>📉 Maiores Quedas de Preço</h3>
              {summary.biggest_drops.map((p) => (
                <Link href={`/products/${p.id}`} key={p.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 8px", borderBottom: "1px solid var(--border)", cursor: "pointer" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: "500", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title.substring(0, 35)}...</p>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>${p.current_price} → ${p.previous_price}</p>
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "#16a34a", backgroundColor: "#f0fdf4", padding: "4px 10px", borderRadius: "20px", flexShrink: 0, marginLeft: "12px" }}>{p.variation_pct}%</span>
                  </div>
                </Link>
              ))}
            </div>

            {summary.biggest_rises.length > 0 ? (
              <div style={{ backgroundColor: "var(--bg-card)", borderRadius: "14px", padding: "20px", boxShadow: "var(--shadow)", border: "1px solid var(--border)", borderLeft: "4px solid #ef4444", transition: "background-color 0.2s" }}>
                <h3 style={{ fontSize: "12px", fontWeight: "700", color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "16px" }}>📈 Maiores Altas de Preço</h3>
                {summary.biggest_rises.map((p) => (
                  <Link href={`/products/${p.id}`} key={p.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 8px", borderBottom: "1px solid var(--border)", cursor: "pointer" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: "500", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title.substring(0, 35)}...</p>
                        <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>${p.previous_price} → ${p.current_price}</p>
                      </div>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: "#dc2626", backgroundColor: "#fef2f2", padding: "4px 10px", borderRadius: "20px", flexShrink: 0, marginLeft: "12px" }}>+{p.variation_pct}%</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ backgroundColor: "var(--bg-card)", borderRadius: "14px", padding: "20px", boxShadow: "var(--shadow)", border: "1px solid var(--border)", transition: "background-color 0.2s" }}>
                <h3 style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>📋 Resumo do Período</h3>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "20px" }}>Visão geral das variações identificadas</p>
                {[
                  { label: "Produtos monitorados", value: kpis?.total_products, color: "#2563eb" },
                  { label: "Total de coletas realizadas", value: kpis?.total_records, color: "#7c3aed" },
                  { label: "Produtos com queda de preço", value: kpis?.products_dropping, color: "#16a34a" },
                  { label: "Produtos com preço estável", value: kpis?.products_stable, color: "#6b7280" },
                  { label: "Desconto médio atual", value: `${kpis?.avg_discount}%`, color: "#d97706" },
                ].map((item) => (
                  <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{item.label}</span>
                    <span style={{ fontSize: "14px", fontWeight: "700", color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}
        {/* Grid de produtos */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <h2 style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>🛒 Todos os Produtos</h2>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{products.length} produtos</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </div>
    </main>
  );
}