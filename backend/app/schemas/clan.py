from datetime import datetime
from pydantic import BaseModel, Field, computed_field


class ClanBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    tag: str = Field(..., min_length=1, max_length=15)
    description: str | None = None
    roster: str | None = Field(default="", description="Список никнеймов игроков через запятую")
    logo_url: str | None = None
    banner_url: str | None = None
    discord_url: str | None = None


class ClanCreate(ClanBase):
    initial_points: int = Field(default=0, ge=0, le=1000)


class ClanUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    tag: str | None = Field(None, min_length=1, max_length=15)
    description: str | None = None
    roster: str | None = None
    logo_url: str | None = None
    banner_url: str | None = None
    discord_url: str | None = None
    is_active: bool | None = None


class ClanRosterUpdate(BaseModel):
    roster: str | None = Field(None, description="Список никнеймов игроков через запятую")
    members: list[str] | None = Field(None, description="Список никнеймов игроков")


class ClanRatingAdjust(BaseModel):
    delta: int = Field(..., description="Изменение очков CRL, например +10 или -10")
    reason: str = Field(..., min_length=3, description="Обоснование / тема заявки с почты")
    proof_url: str | None = Field(None, description="Ссылка на пруфы: скриншоты, YouTube, демо")


class ClanResponse(ClanBase):
    id: int
    points: int
    previous_points: int
    points_reached_at: datetime | None = None
    rank: int
    rank_change: int
    tier: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    @computed_field
    @property
    def members(self) -> list[str]:
        if not self.roster:
            return []
        return [n.strip() for n in self.roster.split(",") if n.strip()]

    class Config:
        from_attributes = True


class ClanDetailResponse(ClanResponse):
    pass
