import Link from "next/link";

export default function ProductCard({ product }) {
  return (
    <Link href={`/products/${product.id}`}>
      <div style={{
        backgroundColor: "var(--bg-card)",
        borderRadius: "14px",
        padding: "20px",
        boxShadow: "var(--shadow)",
        border: "1px solid var(--border)",
        cursor: "pointer",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "background-color 0.2s, box-shadow 0.2s",
      }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
            <span style={{ fontSize: "10px", fontWeight: "600", color: "#2563eb", backgroundColor: "#eff6ff", padding: "3px 8px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {product.category?.replace(/-/g, " ")}
            </span>
            {product.discount_percentage > 0 && (
              <span style={{ fontSize: "11px", fontWeight: "700", color: "#15803d", backgroundColor: "#f0fdf4", padding: "3px 8px", borderRadius: "20px" }}>
                -{product.discount_percentage}%
              </span>
            )}
          </div>
          <h2 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", lineHeight: "1.5", marginBottom: "16px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {product.title}
          </h2>
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", marginBottom: "12px" }}>
            <span style={{ fontSize: "22px", fontWeight: "700", color: "#1d4ed8" }}>
              ${product.latest_price?.toFixed(2) ?? "—"}
            </span>
            {product.original_price && product.original_price > product.latest_price && (
              <span style={{ fontSize: "12px", color: "var(--text-muted)", textDecoration: "line-through", marginBottom: "2px" }}>
                ${product.original_price.toFixed(2)}
              </span>
            )}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "10px", borderTop: "1px solid var(--border)" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{product.seller_name}</span>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              {product.last_collected_at ? new Date(product.last_collected_at).toLocaleDateString("pt-BR") : "—"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}