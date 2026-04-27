from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ProfileCreate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None


class ProfileUpdate(ProfileCreate):
    pass


class ProfileOut(BaseModel):
    id: str
    user_id: str
    full_name: Optional[str]
    phone: Optional[str]
    address: Optional[str]
    city: Optional[str]
    country: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
