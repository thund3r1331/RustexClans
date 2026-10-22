from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db, require_moderator
from app.models.clan import Clan
from app.models.rating_log import RatingLog
from app.models.user import User
from app.schemas.clan import (
    ClanCreate,
    ClanDetailResponse,
    ClanRatingAdjust,
    ClanResponse,
    ClanRosterUpdate,
    ClanUpdate,
)
from app.schemas.rating import RatingLogResponse
from app.services.ranking import determine_tier, recalculate_all_clan_ranks

router = APIRouter(prefix="/clans", tags=["Кланы"])


@router.get("", response_model=list[ClanResponse], summary="Список кланов (публичный)")
async def list_clans(
    search: str | None = Query(None, description="Поиск по названию или тегу"),
    tier: str | None = Query(None, description="Фильтр по тиру (Tier 1, Tier 2, Tier 3)"),
    db: AsyncSession = Depends(get_db),
):
    query = select(Clan).where(Clan.is_active == True)

    if search:
        search_pattern = f"%{search}%"
        query = query.where((Clan.name.ilike(search_pattern)) | (Clan.tag.ilike(search_pattern)))

    if tier:
        query = query.where(Clan.tier == tier)

    query = query.order_by(Clan.rank.asc(), Clan.points.desc())
    result = await db.execute(query)
    clans = result.scalars().all()

    return [ClanResponse.model_validate(c) for c in clans]


@router.get("/{clan_id}", response_model=ClanDetailResponse, summary="Детальная информация о клане")
async def get_clan(clan_id: int, db: AsyncSession = Depends(get_db)):
    clan = await db.get(Clan, clan_id)
    if not clan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Клан не найден")

    return ClanDetailResponse.model_validate(clan)


@router.get("/{clan_id}/history", response_model=list[RatingLogResponse], summary="История рейтинга клана (для графика)")
async def get_clan_rating_history(clan_id: int, db: AsyncSession = Depends(get_db)):
    query = (
        select(RatingLog)
        .where(RatingLog.clan_id == clan_id)
        .order_by(RatingLog.created_at.asc())
    )
    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=ClanResponse, status_code=status.HTTP_201_CREATED, summary="Создать клан (Модератор)")
async def create_clan(
    clan_in: ClanCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_moderator),
):
    exists_query = select(Clan).where(Clan.name == clan_in.name)
    if (await db.execute(exists_query)).scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Клан с таким именем уже существует")

    initial_pts = max(0, min(1000, clan_in.initial_points))
    now = datetime.now(timezone.utc)
    new_clan = Clan(
        name=clan_in.name,
        tag=clan_in.tag,
        description=clan_in.description,
        roster=clan_in.roster or "",
        logo_url=clan_in.logo_url,
        banner_url=clan_in.banner_url,
        discord_url=clan_in.discord_url,
        points=initial_pts,
        previous_points=initial_pts,
        points_reached_at=now,
        rank=0,
        rank_change=0,
        tier=determine_tier(999, initial_pts),
        is_active=True,
    )
    db.add(new_clan)
    await db.commit()

    await recalculate_all_clan_ranks(db)
    await db.refresh(new_clan)

    return ClanResponse.model_validate(new_clan)


@router.put("/{clan_id}", response_model=ClanResponse, summary="Редактировать клан (Модератор)")
async def update_clan(
    clan_id: int,
    clan_in: ClanUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_moderator),
):
    clan = await db.get(Clan, clan_id)
    if not clan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Клан не найден")

    update_data = clan_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(clan, field, val)

    await db.commit()
    await recalculate_all_clan_ranks(db)
    await db.refresh(clan)

    return ClanResponse.model_validate(clan)


@router.put("/{clan_id}/roster", response_model=ClanResponse, summary="Обновить состав клана (Лидер клана или Модератор)")
async def update_clan_roster(
    clan_id: int,
    data: ClanRosterUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    clan = await db.get(Clan, clan_id)
    if not clan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Клан не найден")

    # Проверка прав: модератор/админ ИЛИ лидер именно этого клана
    is_mod = current_user.role in ("admin", "moderator")
    is_leader_of_clan = current_user.role == "clan_leader" and current_user.clan_id == clan_id

    if not (is_mod or is_leader_of_clan):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Вы можете изменять состав только своего клана",
        )

    if data.members is not None:
        cleaned = [m.strip() for m in data.members if m and m.strip()]
        clan.roster = ", ".join(cleaned)
    elif data.roster is not None:
        clan.roster = data.roster.strip()

    await db.commit()
    await db.refresh(clan)
    return ClanResponse.model_validate(clan)


@router.post("/{clan_id}/adjust-rating", response_model=ClanResponse, summary="Изменить рейтинг клана по заявке (Модератор)")
async def adjust_rating(
    clan_id: int,
    adj: ClanRatingAdjust,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_moderator),
):
    clan = await db.get(Clan, clan_id)
    if not clan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Клан не найден")

    old_points = clan.points
    new_points = max(0, min(1000, old_points + adj.delta))
    
    clan.previous_points = old_points
    if new_points != old_points:
        clan.points_reached_at = datetime.now(timezone.utc)
    clan.points = new_points

    log_entry = RatingLog(
        clan_id=clan.id,
        old_points=old_points,
        new_points=new_points,
        delta=adj.delta,
        reason=adj.reason,
        proof_url=adj.proof_url,
        moderator_username=current_user.username,
    )
    db.add(log_entry)
    await db.commit()

    await recalculate_all_clan_ranks(db)
    await db.refresh(clan)

    return ClanResponse.model_validate(clan)


@router.delete("/{clan_id}", summary="Удалить/деактивировать клан (Модератор)")
async def delete_clan(
    clan_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_moderator),
):
    clan = await db.get(Clan, clan_id)
    if not clan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Клан не найден")

    await db.delete(clan)
    await db.commit()
    await recalculate_all_clan_ranks(db)
    return {"message": f"Клан '{clan.name}' успешно удален"}
