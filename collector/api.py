import requests


def search_products(query, limit=5):
    """
    Busca produtos na Fake Store API.
    Filtra por termo de busca no título do produto.
    Substituta temporária da API do Mercado Livre.
    """
    url = "https://fakestoreapi.com/products"

    response = requests.get(url)

    if response.status_code != 200:
        raise Exception(f"Erro na busca: {response.status_code} - {response.text}")

    all_products = response.json()

    # Filtra produtos que contenham o termo no título
    query_lower = query.lower()
    filtered = [
        p for p in all_products
        if query_lower in p.get("title", "").lower()
        or query_lower in p.get("category", "").lower()
    ]

    # Se não encontrar nada com o filtro, retorna os primeiros da lista
    if not filtered:
        filtered = all_products

    return filtered[:limit]


def extract_product_data(item):
    """
    Normaliza os dados da Fake Store API para o formato do banco.
    Mantém a mesma estrutura que usaríamos com o Mercado Livre.
    """
    price = float(item.get("price", 0))

    # Simula um preço original (10% acima) para demonstrar o cálculo de desconto
    original_price = round(price * 1.10, 2)
    discount       = round((1 - price / original_price) * 100, 2)

    return {
        "ml_product_id":       f"FAKE{item.get('id')}",
        "title":               item.get("title"),
        "permalink":           f"https://fakestoreapi.com/products/{item.get('id')}",
        "category":            item.get("category"),
        "seller_name":         "FakeStore",
        "price":               price,
        "original_price":      original_price,
        "discount_percentage": discount,
    }