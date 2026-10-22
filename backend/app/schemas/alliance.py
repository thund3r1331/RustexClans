from datetime import datetime
from pydantic import BaseModel


class AllianceOut(BaseModel):
    id: int
    requester_clan_id: int
    requester_clan_name: str
    requester_clan_tag: str
    target_clan_id: int
    target_clan_name: str
    target_clan_tag: str
    status: str  # pending | accepted | rejected
    created_at: datetime

    class Config:
        from_attributes = True


class AllianceRequest(BaseModel):
    target_clan_id: int
