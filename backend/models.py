from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PriceRecord(BaseModel):
    id: int
    price: float
    original_price: Optional[float]
    discount_percentage: Optional[float]
    collected_at: datetime


class Product(BaseModel):
    id: int
    ml_product_id: str
    title: str
    permalink: Optional[str]
    category: Optional[str]
    seller_name: Optional[str]
    created_at: datetime


class ProductWithLatestPrice(BaseModel):
    id: int
    ml_product_id: str
    title: str
    category: Optional[str]
    seller_name: Optional[str]
    permalink: Optional[str]
    latest_price: Optional[float]
    original_price: Optional[float]
    discount_percentage: Optional[float]
    last_collected_at: Optional[datetime]