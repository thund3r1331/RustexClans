from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db, require_clan_leader
from app.models.alliance import Alliance
from app.models.clan import Clan
from app.models.user import User
from app.schemas.alliance import AllianceOut, AllianceRequest

router = APIRouter(prefix="/alliances", tags=["Альянсы"])


async def _build_out(alliance: Alliance, db: AsyncSession) -> AllianceOut:
    """Загружает имена кланов для одного альянса."""
    r_res = await db.execute(select(Clan).where(Clan.id == alliance.requester_clan_id))
    t_res = await db.execute(select(Clan).where(Clan.id == alliance.target_clan_id))
    r_clan = r_res.scalar_one_or_none()
    t_clan = t_res.scalar_one_or_none()
    return AllianceOut(
        id=alliance.id,
        requester_clan_id=alliance.requester_clan_id,
        requester_clan_name=r_clan.name if r_clan else "Удалён",
        requester_clan_tag=r_clan.tag if r_clan else "???",
        target_clan_id=alliance.target_clan_id,
        target_clan_name=t_clan.name if t_clan else "Удалён",
        target_clan_tag=t_clan.tag if t_clan else "???",
        status=alliance.status,
        created_at=alliance.created_at,
    )


# ── Публичные ──────────────────────────────────────────────────────────────

@router.get("/", response_model=list[AllianceOut], summary="Все активные альянсы (публично)")
async def list_alliances(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Alliance)
        .where(Alliance.status == "accepted")
        .order_by(Alliance.updated_at.desc())
    )
    alliances = result.scalars().all()
    return [await _build_out(a, db) for a in alliances]


@router.get("/clan/{clan_id}", response_model=list[AllianceOut], summary="Альянсы конкретного клана (публично)")
async def clan_alliances(clan_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Alliance).where(
            Alliance.status == "accepted",
            or_(Alliance.requester_clan_id == clan_id, Alliance.target_clan_id == clan_id),
        )
    )
    alliances = result.scalars().all()
    return [await _build_out(a, db) for a in alliances]


# ── Для лидеров кланов ─────────────────────────────────────────────────────

@router.get("/my", response_model=list[AllianceOut], summary="Мои альянсы и входящие заявки")
async def my_alliances(
    current_user: User = Depends(require_clan_leader),
    db: AsyncSession = Depends(get_db),
):
    clan_id = current_user.clan_id
    result = await db.execute(
        select(Alliance).where(
            or_(Alliance.requester_clan_id == clan_id, Alliance.target_clan_id == clan_id)
        ).order_by(Alliance.created_at.desc())
    )
    alliances = result.scalars().all()
    return [await _build_out(a, db) for a in alliances]


@router.post("/request", response_model=AllianceOut, status_code=status.HTTP_201_CREATED, summary="Отправить запрос на альянс")
async def request_alliance(
    data: AllianceRequest,
    current_user: User = Depends(require_clan_leader),
    db: AsyncSession = Depends(get_db),
):
    my_clan_id = current_user.clan_id

    if data.target_clan_id == my_clan_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Нельзя создать альянс с самим собой",
        )

    # Проверяем существование целевого клана
    t_res = await db.execute(select(Clan).where(Clan.id == data.target_clan_id, Clan.is_active == True))
    if not t_res.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Клан не найден")

    # Проверяем нет ли уже pending/accepted альянса между этими двумя кланами
    existing = await db.execute(
        select(Alliance).where(
            Alliance.status.in_(["pending", "accepted"]),
            or_(
                and_(Alliance.requester_clan_id == my_clan_id, Alliance.target_clan_id == data.target_clan_id),
                and_(Alliance.requester_clan_id == data.target_clan_id, Alliance.target_clan_id == my_clan_id),
            ),
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Альянс или активный запрос между этими кланами уже существует",
        )

    alliance = Alliance(
        requester_clan_id=my_clan_id,
        target_clan_id=data.target_clan_id,
        status="pending",
    )
    db.add(alliance)
    await db.commit()
    await db.refresh(alliance)
    return await _build_out(alliance, db)


@router.post("/{alliance_id}/accept", response_model=AllianceOut, summary="Принять запрос на альянс")
async def accept_alliance(
    alliance_id: int,
    current_user: User = Depends(require_clan_leader),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Alliance).where(Alliance.id == alliance_id))
    alliance = result.scalar_one_or_none()
    if not alliance:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Альянс не найден")

    if alliance.target_clan_id != current_user.clan_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Только лидер целевого клана может принять этот запрос",
        )

    if alliance.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Запрос уже обработан (статус: {alliance.status})",
        )

    alliance.status = "accepted"
    db.add(alliance)
    await db.commit()
    await db.refresh(alliance)
    return await _build_out(alliance, db)


@router.post("/{alliance_id}/reject", response_model=AllianceOut, summary="Отклонить запрос на альянс")
async def reject_alliance(
    alliance_id: int,
    current_user: User = Depends(require_clan_leader),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Alliance).where(Alliance.id == alliance_id))
    alliance = result.scalar_one_or_none()
    if not alliance:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Альянс не найден")

    if alliance.target_clan_id != current_user.clan_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Только лидер целевого клана может отклонить этот запрос",
        )

    if alliance.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Запрос уже обработан (статус: {alliance.status})",
        )

    alliance.status = "rejected"
    db.add(alliance)
    await db.commit()
    await db.refresh(alliance)
    return await _build_out(alliance, db)


@router.delete("/{alliance_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Разорвать альянс")
async def delete_alliance(
    alliance_id: int,
    current_user: User = Depends(require_clan_leader),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Alliance).where(Alliance.id == alliance_id))
    alliance = result.scalar_one_or_none()
    if not alliance:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Альянс не найден")

    # Только участник альянса может его разорвать
    if current_user.clan_id not in (alliance.requester_clan_id, alliance.target_clan_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Только участник альянса может его разорвать",
        )

    await db.delete(alliance)
    await db.commit()
