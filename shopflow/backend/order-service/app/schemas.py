from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models import OrderStatus


class OrderCreate(BaseModel):
    product_id: str
    quantity: int


class OrderOut(BaseModel):
    id: str
    user_id: str
    product_id: str
    product_name: str
    quantity: int
    unit_price: float
    total_price: float
    status: OrderStatus
    created_at: datetime

    model_config = {"from_attributes": True}


class OrderStatusUpdate(BaseModel):
    status: OrderStatus
