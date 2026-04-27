from typing import List

import httpx
from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.database import get_db
from app.models import Order
from app.schemas import OrderCreate, OrderOut, OrderStatusUpdate

router = APIRouter(prefix="/orders", tags=["orders"])


async def get_current_user(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{settings.auth_service_url}/auth/verify", params={"token": token})
    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return resp.json()


@router.get("/health")
async def health():
    return {"status": "ok", "service": "order-service"}


@router.post("/", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
async def create_order(
    payload: OrderCreate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{settings.product_service_url}/products/{payload.product_id}")
    if resp.status_code != 200:
        raise HTTPException(status_code=404, detail="Product not found")

    product = resp.json()
    if product["stock"] < payload.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")

    total = product["price"] * payload.quantity
    order = Order(
        user_id=user["user_id"],
        product_id=payload.product_id,
        product_name=product["name"],
        quantity=payload.quantity,
        unit_price=product["price"],
        total_price=total,
    )
    db.add(order)
    await db.commit()
    await db.refresh(order)
    return order


@router.get("/", response_model=List[OrderOut])
async def list_orders(
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    result = await db.execute(select(Order).where(Order.user_id == user["user_id"]))
    return result.scalars().all()


@router.get("/{order_id}", response_model=OrderOut)
async def get_order(
    order_id: str,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    result = await db.execute(select(Order).where(Order.id == order_id, Order.user_id == user["user_id"]))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.patch("/{order_id}/status", response_model=OrderOut)
async def update_order_status(
    order_id: str,
    payload: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = payload.status
    await db.commit()
    await db.refresh(order)
    return order
