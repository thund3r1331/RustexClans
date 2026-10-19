from datetime import datetime
from pydantic import BaseModel, Field


class PlayerBase(BaseModel):
    nickname: str = Field(..., min_length=2, max_length=100)
    steam_id: str = Field(..., min_length=5, max_length=30)
    avatar_url: str | None = None
    role_in_clan: str = Field(default="member", pattern="^(leader|member|recruit|substitute)$")


class PlayerCreate(PlayerBase):
    clan_id: int | None = None


class PlayerUpdate(BaseModel):
    nickname: str | None = Field(None, min_length=2, max_length=100)
    steam_id: str | None = Field(None, min_length=5, max_length=30)
    avatar_url: str | None = None
    role_in_clan: str | None = Field(None, pattern="^(leader|member|recruit|substitute)$")
    clan_id: int | None = None


class PlayerShort(BaseModel):
    id: int
    nickname: str
    steam_id: str
    avatar_url: str | None = None
    role_in_clan: str

    class Config:
        from_attributes = True


class PlayerResponse(PlayerBase):
    id: int
    clan_id: int | None = None
    created_at: datetime

    class Config:
        from_attributes = True
