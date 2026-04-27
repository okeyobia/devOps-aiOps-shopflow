from fastapi import FastAPI, Request, Response, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from jose import JWTError, jwt
import httpx
from typing import Optional

from app.core.config import settings

app = FastAPI(title="ShopFlow Gateway", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Instrumentator().instrument(app).expose(app)

PUBLIC_ROUTES = [
    ("/api/auth/login", "POST"),
    ("/api/auth/register", "POST"),
    ("/api/products", "GET"),
]

SERVICE_MAP = {
    "/api/auth": settings.auth_service_url,
    "/api/products": settings.product_service_url,
    "/api/orders": settings.order_service_url,
    "/api/users": settings.user_service_url,
}


def get_upstream(path: str) -> Optional[str]:
    for prefix, url in SERVICE_MAP.items():
        if path.startswith(prefix):
            stripped = path[len(prefix):]
            service_path = path.replace(f"/api/{prefix.split('/')[-1]}", f"/{prefix.split('/')[-1]}")
            return url, stripped
    return None, None


def is_public(path: str, method: str) -> bool:
    for route, m in PUBLIC_ROUTES:
        if path.startswith(route) and method == m:
            return True
    return False


def verify_jwt(token: str) -> dict:
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "gateway"}


@app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
async def proxy(path: str, request: Request):
    full_path = f"/api/{path}"
    method = request.method

    auth_header = request.headers.get("authorization", "")
    if not is_public(full_path, method):
        if not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Authorization header missing")
        verify_jwt(auth_header.replace("Bearer ", ""))

    upstream_base = None
    service_path = None
    for prefix, url in SERVICE_MAP.items():
        if full_path.startswith(prefix):
            upstream_base = url
            service_path = full_path[len("/api"):]
            break

    if not upstream_base:
        raise HTTPException(status_code=404, detail="Route not found")

    upstream_url = f"{upstream_base}{service_path}"
    if request.url.query:
        upstream_url += f"?{request.url.query}"

    body = await request.body()
    headers = {k: v for k, v in request.headers.items() if k.lower() not in ("host", "content-length")}

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.request(method=method, url=upstream_url, content=body, headers=headers)

    return Response(
        content=resp.content,
        status_code=resp.status_code,
        headers=dict(resp.headers),
        media_type=resp.headers.get("content-type"),
    )
