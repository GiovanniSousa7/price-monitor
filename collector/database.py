import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()


def get_connection():
    """
    Cria e retorna uma conexão com o banco PostgreSQL.
    """
    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        raise ValueError("DATABASE_URL não encontrada. Verifique seu arquivo .env")

    return psycopg2.connect(database_url)


def save_product(conn, product_data):
    """
    Insere um produto no banco se ele ainda não existir.
    Usa o ml_product_id como chave única para evitar duplicatas.
    Retorna o ID interno do produto (seja novo ou já existente).
    """
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO products (ml_product_id, title, permalink, category, seller_name)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (ml_product_id) DO UPDATE
            SET title       = EXCLUDED.title,
                seller_name = EXCLUDED.seller_name
        RETURNING id
    """, (
        product_data["ml_product_id"],
        product_data["title"],
        product_data["permalink"],
        product_data["category"],
        product_data["seller_name"],
    ))

    product_id = cursor.fetchone()[0]
    conn.commit()
    cursor.close()
    return product_id


def save_price_record(conn, product_id, product_data):
    """
    Registra o preço atual de um produto no histórico.
    Sempre insere um novo registro — nunca atualiza o anterior.
    Isso preserva o histórico completo de variações.
    """
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO price_records (product_id, price, original_price, discount_percentage)
        VALUES (%s, %s, %s, %s)
    """, (
        product_id,
        product_data["price"],
        product_data["original_price"],
        product_data["discount_percentage"],
    ))

    conn.commit()
    cursor.close()


def test_connection():
    """
    Testa se a conexão com o banco está funcionando.
    """
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"✅ Conexão bem-sucedida!")
        print(f"   PostgreSQL: {version[0]}")
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"❌ Erro na conexão: {e}")


if __name__ == "__main__":
    test_connection()