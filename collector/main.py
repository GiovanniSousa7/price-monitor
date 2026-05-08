from api import search_products, extract_product_data
from database import get_connection, save_product, save_price_record

SEARCH_QUERIES = [
    "laptop",
    "phone",
    "watch",
]

RESULTS_PER_QUERY = 5


def run_collection():
    print("🚀 Iniciando coleta de preços...")

    conn = get_connection()
    print("✅ Conectado ao banco de dados")

    total_saved = 0

    for query in SEARCH_QUERIES:
        print(f"\n🔍 Buscando: '{query}'")
        products = search_products(query, limit=RESULTS_PER_QUERY)
        print(f"   {len(products)} produtos encontrados")

        for item in products:
            try:
                product_data = extract_product_data(item)
                product_id   = save_product(conn, product_data)
                save_price_record(conn, product_id, product_data)

                print(f"   ✅ {product_data['title'][:60]}...")
                print(f"      Preço: R$ {product_data['price']:,.2f} | "
                      f"Desconto: {product_data['discount_percentage']}%")

                total_saved += 1

            except Exception as e:
                print(f"   ❌ Erro ao processar produto: {e}")
                continue

    conn.close()
    print(f"\n🎉 Coleta finalizada! {total_saved} registros salvos.")


if __name__ == "__main__":
    run_collection()