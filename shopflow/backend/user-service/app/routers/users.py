import httpx
from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.database import get_db
from app.models import UserProfile
from app.schemas import ProfileCreate, ProfileOut, ProfileUpdate

router = APIRouter(prefix="/users", tags=["users"])


async def get_current_user(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    from jose import JWTError, jwt
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Unauthorized")


@router.get("/health")
async def health():
    return {"status": "ok", "service": "user-service"}


@router.get("/me", response_model=ProfileOut)
async def get_my_profile(
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    result = await db.execute(select(UserProfile).where(UserProfile.user_id == user["user_id"]))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.post("/me", response_model=ProfileOut)
async def create_profile(
    payload: ProfileCreate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    result = await db.execute(select(UserProfile).where(UserProfile.user_id == user["user_id"]))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Profile already exists")

    profile = UserProfile(user_id=user["user_id"], **payload.model_dump())
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return profile


@router.put("/me", response_model=ProfileOut)
async def update_profile(
    payload: ProfileUpdate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    result = await db.execute(select(UserProfile).where(UserProfile.user_id == user["user_id"]))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)

    await db.commit()
    await db.refresh(profile)
    return profile
