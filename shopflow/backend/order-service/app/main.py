from contextlib import asynccontextmanager

from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator

from app.database import init_db
from app.routers import orders


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="ShopFlow Order Service", version="1.0.0", lifespan=lifespan)

Instrumentator().instrument(app).expose(app)

app.include_router(orders.router)
