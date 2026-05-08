const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function getProducts() {
  const res = await fetch(`${API_URL}/api/v1/products`, {
    cache: "no-store"
  });
  if (!res.ok) throw new Error("Erro ao buscar produtos");
  return res.json();
}

export async function getProductHistory(id) {
  const res = await fetch(`${API_URL}/api/v1/products/${id}/history`, {
    cache: "no-store"
  });
  if (!res.ok) throw new Error("Erro ao buscar histórico");
  return res.json();
}

export async function getProductStats(id) {
  const res = await fetch(`${API_URL}/api/v1/products/${id}/stats`, {
    cache: "no-store"
  });
  if (!res.ok) throw new Error("Erro ao buscar estatísticas");
  return res.json();
}

export async function getDashboardSummary() {
  const res = await fetch(`${API_URL}/api/v1/dashboard/summary`, {
    cache: "no-store"
  });
  if (!res.ok) throw new Error("Erro ao buscar resumo");
  return res.json();
}