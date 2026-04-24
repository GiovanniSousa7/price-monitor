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