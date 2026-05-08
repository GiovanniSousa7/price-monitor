import requests


def search_products(query, limit=5):
    """
    Busca produtos na DummyJSON API.
    API aberta, sem autenticação, sem bloqueio de servidor.
    """
    url = f"https://dummyjson.com/products/search"

    params = {"q": query, "limit": limit}

    response = requests.get(url, params=params)

    if response.status_code != 200:
        raise Exception(f"Erro na busca: {response.status_code} - {response.text}")

    return response.json().get("products", [])


def extract_product_data(item):
    """
    Normaliza os dados da DummyJSON para o formato do banco.
    """
    price          = float(item.get("price", 0))
    discount       = float(item.get("discountPercentage", 0))
    original_price = round(price / (1 - discount / 100), 2) if discount > 0 else price

    return {
        "ml_product_id":       f"DUM{item.get('id')}",
        "title":               item.get("title"),
        "permalink":           f"https://dummyjson.com/products/{item.get('id')}",
        "category":            item.get("category"),
        "seller_name":         item.get("brand", "DummyStore"),
        "price":               price,
        "original_price":      original_price,
        "discount_percentage": round(discount, 2),
    }