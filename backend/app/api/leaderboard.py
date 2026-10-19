from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.models.clan import Clan
from app.schemas.rating import LeaderboardItem

router = APIRouter(prefix="/leaderboard", tags=["Таблица лидеров (CRL Ranking)"])


@router.get("", response_model=list[LeaderboardItem], summary="Главная рейтинговая таблица кланов")
async def get_leaderboard(
    tier: str | None = Query(None, description="Фильтр по уровню: Tier 1, Tier 2, Tier 3"),
    search: str | None = Query(None, description="Поиск по тегу или названию"),
    db: AsyncSession = Depends(get_db),
):
    query = select(Clan).where(Clan.is_active == True)

    if tier:
        query = query.where(Clan.tier == tier)

    if search:
        search_pattern = f"%{search}%"
        query = query.where((Clan.name.ilike(search_pattern)) | (Clan.tag.ilike(search_pattern)))

    query = query.order_by(Clan.rank.asc(), Clan.points.desc())
    result = await db.execute(query)
    clans = result.scalars().all()

    return [LeaderboardItem.model_validate(c) for c in clans]
