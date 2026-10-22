from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.clan import Clan


def determine_tier(rank: int, points: int) -> str:
    """
    Тиры соревновательного ладдера (максимум 1000 CRL):
    Tier 1 - Элита (топ-3 или 800+ CRL)
    Tier 2 - Опытные стабильные кланы (топ-8 или 400+ CRL)
    Tier 3 - Растущие и новые команды (< 400 CRL)
    """
    if rank <= 3 or points >= 800:
        return "Tier 1"
    if rank <= 8 or points >= 400:
        return "Tier 2"
    return "Tier 3"


async def recalculate_all_clan_ranks(session: AsyncSession) -> None:
    query = (
        select(Clan)
        .where(Clan.is_active == True)
        .order_by(Clan.points.desc(), Clan.points_reached_at.asc(), Clan.id.asc())
    )
    result = await session.execute(query)
    clans = result.scalars().all()

    for new_rank_idx, clan in enumerate(clans, start=1):
        old_rank = clan.rank
        
        if old_rank > 0:
            clan.rank_change = old_rank - new_rank_idx
        else:
            clan.rank_change = 0  # новый клан без предыдущего ранга

        clan.rank = new_rank_idx
        clan.tier = determine_tier(new_rank_idx, clan.points)
        # print(f"DEBUG [ranking]: Clan {clan.tag} -> Rank #{clan.rank} ({clan.rank_change:+d}) {clan.tier}")

    await session.commit()
