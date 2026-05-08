from fastapi import APIRouter, HTTPException
from backend.database import get_connection
from backend.models import ProductWithLatestPrice, PriceRecord
from typing import List

router = APIRouter()


@router.get("/products", response_model=List[ProductWithLatestPrice])
def get_products():
    """
    Retorna todos os produtos monitorados com o último preço coletado.
    """
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            p.id,
            p.ml_product_id,
            p.title,
            p.category,
            p.seller_name,
            p.permalink,
            pr.price         AS latest_price,
            pr.original_price,
            pr.discount_percentage,
            pr.collected_at  AS last_collected_at
        FROM products p
        LEFT JOIN LATERAL (
            SELECT price, original_price, discount_percentage, collected_at
            FROM price_records
            WHERE product_id = p.id
            ORDER BY collected_at DESC
            LIMIT 1
        ) pr ON true
        ORDER BY p.title
    """)

    rows = cursor.fetchall()
    columns = [desc[0] for desc in cursor.description]
    cursor.close()
    conn.close()

    return [dict(zip(columns, row)) for row in rows]


@router.get("/products/{product_id}/history", response_model=List[PriceRecord])
def get_price_history(product_id: int):
    """
    Retorna o histórico completo de preços de um produto específico.
    """
    conn = get_connection()
    cursor = conn.cursor()

    # Verifica se o produto existe
    cursor.execute("SELECT id FROM products WHERE id = %s", (product_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    cursor.execute("""
        SELECT id, price, original_price, discount_percentage, collected_at
        FROM price_records
        WHERE product_id = %s
        ORDER BY collected_at DESC
    """, (product_id,))

    rows = cursor.fetchall()
    columns = [desc[0] for desc in cursor.description]
    cursor.close()
    conn.close()

    return [dict(zip(columns, row)) for row in rows]


@router.get("/products/{product_id}/stats")
def get_product_stats(product_id: int):
    """
    Retorna estatísticas de preço de um produto:
    menor preço, maior preço, média e variação percentual.
    """
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT title FROM products WHERE id = %s", (product_id,))
    product = cursor.fetchone()
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    cursor.execute("""
        SELECT
            MIN(price)                                            AS min_price,
            MAX(price)                                            AS max_price,
            ROUND(AVG(price)::numeric, 2)                        AS avg_price,
            COUNT(*)                                             AS total_records,
            MIN(collected_at)                                    AS first_collected,
            MAX(collected_at)                                    AS last_collected
        FROM price_records
        WHERE product_id = %s
    """, (product_id,))

    row = cursor.fetchone()
    columns = [desc[0] for desc in cursor.description]
    cursor.close()
    conn.close()

    stats = dict(zip(columns, row))
    stats["product_title"] = product[0]

    # Calcula variação entre menor e maior preço
    if stats["min_price"] and stats["max_price"]:
        stats["price_variation_pct"] = round(
            (stats["max_price"] - stats["min_price"]) / stats["min_price"] * 100, 2
        )
    else:
        stats["price_variation_pct"] = 0.0

    return stats

@router.get("/dashboard/summary")
def get_dashboard_summary():
    """
    Resumo executivo para o dashboard:
    - Total de produtos monitorados
    - Produtos com queda de preço recente
    - Produtos com alta de preço recente
    - Maior oportunidade do momento
    - Tendência geral do mercado
    - Distribuição por categoria
    """
    conn = get_connection()
    cursor = conn.cursor()

    # Variação entre última e penúltima coleta por produto
    cursor.execute("""
        WITH ranked AS (
            SELECT
                p.id,
                p.title,
                p.category,
                p.permalink,
                pr.price,
                pr.discount_percentage,
                ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY pr.collected_at DESC) AS rn
            FROM products p
            JOIN price_records pr ON pr.product_id = p.id
        ),
        latest   AS (SELECT * FROM ranked WHERE rn = 1),
        previous AS (SELECT * FROM ranked WHERE rn = 2)
        SELECT
            l.id,
            l.title,
            l.category,
            l.permalink,
            l.price                  AS current_price,
            l.discount_percentage,
            p.price                  AS previous_price,
            ROUND(((l.price - p.price) / p.price * 100)::numeric, 2) AS variation_pct
        FROM latest l
        JOIN previous p ON p.id = l.id
    """)

    rows      = cursor.fetchall()
    columns   = [desc[0] for desc in cursor.description]
    products  = [dict(zip(columns, row)) for row in rows]

    # Total de produtos
    cursor.execute("SELECT COUNT(*) FROM products")
    total_products = cursor.fetchone()[0]

    # Total de registros coletados
    cursor.execute("SELECT COUNT(*) FROM price_records")
    total_records = cursor.fetchone()[0]

    # Média geral de desconto atual
    cursor.execute("""
        SELECT ROUND(AVG(pr.discount_percentage)::numeric, 2)
        FROM price_records pr
        WHERE pr.id IN (
            SELECT DISTINCT ON (product_id) id
            FROM price_records
            ORDER BY product_id, collected_at DESC
        )
    """)
    avg_discount = cursor.fetchone()[0] or 0

    # Distribuição por categoria com preço médio
    cursor.execute("""
        SELECT
            p.category,
            COUNT(DISTINCT p.id)          AS total,
            ROUND(AVG(pr.price)::numeric, 2) AS avg_price
        FROM products p
        JOIN price_records pr ON pr.product_id = p.id
        WHERE pr.id IN (
            SELECT DISTINCT ON (product_id) id
            FROM price_records
            ORDER BY product_id, collected_at DESC
        )
        GROUP BY p.category
        ORDER BY total DESC
        LIMIT 5
    """)
    cat_rows = cursor.fetchall()
    categories = [{"category": r[0], "total": r[1], "avg_price": r[2]} for r in cat_rows]

    cursor.close()
    conn.close()

    drops  = [p for p in products if p["variation_pct"] < 0]
    rises  = [p for p in products if p["variation_pct"] > 0]
    stable = [p for p in products if p["variation_pct"] == 0]

    # Oportunidades: queda de preço + desconto alto
    opportunities = sorted(
        [p for p in drops if (p["discount_percentage"] or 0) > 5],
        key=lambda x: x["variation_pct"]
    )[:3]

    # Tendência geral do mercado
    if len(drops) > len(rises) * 1.5:
        market_trend = "deflation"
    elif len(rises) > len(drops) * 1.5:
        market_trend = "inflation"
    else:
        market_trend = "stable"

    return {
        "kpis": {
            "total_products":    total_products,
            "total_records":     total_records,
            "avg_discount":      float(avg_discount),
            "products_dropping": len(drops),
            "products_rising":   len(rises),
            "products_stable":   len(stable),
            "market_trend":      market_trend,
        },
        "opportunities":  opportunities,
        "biggest_drops":  sorted(drops, key=lambda x: x["variation_pct"])[:5],
        "biggest_rises":  sorted(rises, key=lambda x: -x["variation_pct"])[:5],
        "categories":     categories,
    }