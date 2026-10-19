from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, require_moderator
from app.models.clan import Clan
from app.models.player import Player
from app.models.user import User
from app.schemas.player import PlayerCreate, PlayerResponse, PlayerUpdate

router = APIRouter(prefix="/players", tags=["Игроки"])


@router.get("", response_model=list[PlayerResponse], summary="Список всех игроков")
async def list_players(
    clan_id: int | None = Query(None, description="Фильтр по клану"),
    search: str | None = Query(None, description="Поиск по никнейму или Steam ID"),
    db: AsyncSession = Depends(get_db),
):
    query = select(Player)
    if clan_id is not None:
        query = query.where(Player.clan_id == clan_id)
    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            (Player.nickname.ilike(search_pattern)) | (Player.steam_id.ilike(search_pattern))
        )
    query = query.order_by(Player.id.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{player_id}", response_model=PlayerResponse, summary="Получить профиль игрока")
async def get_player(player_id: int, db: AsyncSession = Depends(get_db)):
    player = await db.get(Player, player_id)
    if not player:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Игрок не найден")
    return player


@router.post("", response_model=PlayerResponse, status_code=status.HTTP_201_CREATED, summary="Создать игрока (Модератор)")
async def create_player(
    player_in: PlayerCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_moderator),
):
    # Проверка уникальности Steam ID
    exists_query = select(Player).where(Player.steam_id == player_in.steam_id)
    if (await db.execute(exists_query)).scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Игрок с таким Steam ID уже существует")

    if player_in.clan_id:
        clan = await db.get(Clan, player_in.clan_id)
        if not clan:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Указанный клан не существует")

    new_player = Player(
        nickname=player_in.nickname,
        steam_id=player_in.steam_id,
        avatar_url=player_in.avatar_url,
        role_in_clan=player_in.role_in_clan,
        clan_id=player_in.clan_id,
    )
    db.add(new_player)
    await db.commit()
    await db.refresh(new_player)
    return new_player


@router.put("/{player_id}", response_model=PlayerResponse, summary="Редактировать игрока (Модератор)")
async def update_player(
    player_id: int,
    player_in: PlayerUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_moderator),
):
    player = await db.get(Player, player_id)
    if not player:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Игрок не найден")

    update_data = player_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(player, field, val)

    await db.commit()
    await db.refresh(player)
    return player


@router.delete("/{player_id}", summary="Удалить игрока (Модератор)")
async def delete_player(
    player_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_moderator),
):
    player = await db.get(Player, player_id)
    if not player:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Игрок не найден")

    await db.delete(player)
    await db.commit()
    return {"message": f"Игрок '{player.nickname}' удален"}
