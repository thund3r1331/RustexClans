from datetime import datetime
from pydantic import BaseModel, computed_field


class RatingLogResponse(BaseModel):
    id: int
    clan_id: int
    old_points: int
    new_points: int
    delta: int
    reason: str
    proof_url: str | None = None
    moderator_username: str
    created_at: datetime

    class Config:
        from_attributes = True


class LeaderboardItem(BaseModel):
    id: int
    rank: int
    rank_change: int  # +2, -1, 0
    name: str
    tag: str
    points: int
    tier: str
    roster: str | None = None
    logo_url: str | None = None
    discord_url: str | None = None

    @computed_field
    @property
    def members(self) -> list[str]:
        if not self.roster:
            return []
        return [n.strip() for n in self.roster.split(",") if n.strip()]

    class Config:
        from_attributes = True
