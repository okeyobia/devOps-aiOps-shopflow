from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category: str
    stock: int = 0
    image_url: Optional[str] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    stock: Optional[int] = None
    image_url: Optional[str] = None


class ProductOut(BaseModel):
    id: str
    name: str
    description: Optional[str]
    price: float
    category: str
    stock: int
    image_url: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
