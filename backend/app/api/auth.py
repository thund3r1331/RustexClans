import asyncio
import time
from collections import defaultdict
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db, require_admin
from app.models.user import User
from app.schemas.auth import (
    AssignClanRequest,
    ChangePasswordRequest,
    LoginRequest,
    RegisterRequest,
    Token,
    UserResponse,
)
from app.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["Аутентификация"])

# In-memory защита от подбора пароля (brute-force)
FAILED_ATTEMPTS: dict[str, list[float]] = defaultdict(list)
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_SECONDS = 900  # 15 минут блокировки после 5 неудачных попыток


def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@router.post("/register", response_model=UserResponse, summary="Регистрация лидера клана")
async def register(
    data: RegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Открытая регистрация для лидеров кланов.
    Создаёт аккаунт с role='clan_leader' и clan_id=None.
    Привязку к клану делает admin вручную через PATCH /auth/users/{id}/assign-clan.
    """
    username = data.username.strip()

    # Проверка уникальности ника
    existing = await db.execute(select(User).where(User.username == username))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Пользователь с таким ником уже существует",
        )

    user = User(
        username=username,
        hashed_password=hash_password(data.password),
        role="clan_leader",
        clan_id=None,
        is_active=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/login", response_model=Token, summary="Вход для лидеров кланов, модераторов и админов")
async def login(
    login_data: LoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    client_ip = get_client_ip(request)
    now = time.time()

    # Очищаем устаревшие записи и проверяем блокировку по IP
    attempts = [t for t in FAILED_ATTEMPTS[client_ip] if now - t < LOCKOUT_SECONDS]
    FAILED_ATTEMPTS[client_ip] = attempts

    if len(attempts) >= MAX_FAILED_ATTEMPTS:
        retry_after = int(LOCKOUT_SECONDS - (now - attempts[0]))
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Слишком много неудачных попыток входа. IP заблокирован на {max(1, retry_after // 60)} мин.",
        )

    username = login_data.username.strip()
    password = login_data.password.strip()

    query = select(User).where(User.username == username)
    result = await db.execute(query)
    user = result.scalar_one_or_none()

    if not user or not verify_password(password, user.hashed_password):
        FAILED_ATTEMPTS[client_ip].append(now)
        await asyncio.sleep(1.0)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверное имя пользователя или пароль",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Аккаунт деактивирован",
        )

    if client_ip in FAILED_ATTEMPTS:
        del FAILED_ATTEMPTS[client_ip]

    access_token = create_access_token(subject=user.username, role=user.role)
    return Token(access_token=access_token, token_type="bearer")


@router.post("/change-password", summary="Смена пароля текущего пользователя")
async def change_password(
    pwd_data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not verify_password(pwd_data.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Текущий пароль указан неверно",
        )

    current_user.hashed_password = hash_password(pwd_data.new_password)
    db.add(current_user)
    await db.commit()
    return {"status": "ok", "message": "Пароль успешно изменён"}


@router.get("/me", response_model=UserResponse, summary="Получить профиль текущего пользователя")
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


# ── Admin-only: управление лидерами кланов ─────────────────────────────────

@router.get(
    "/users",
    response_model=list[UserResponse],
    summary="[admin] Список всех clan_leader аккаунтов",
)
async def list_clan_leaders(
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User).where(User.role == "clan_leader").order_by(User.created_at.desc())
    )
    return result.scalars().all()


@router.patch(
    "/users/{user_id}/assign-clan",
    response_model=UserResponse,
    summary="[admin] Привязать/отвязать лидера клана к клану",
)
async def assign_clan(
    user_id: int,
    data: AssignClanRequest,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден")
    if user.role != "clan_leader":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Привязка клана возможна только для аккаунтов с ролью clan_leader",
        )

    # Проверяем что этот клан ещё не занят другим лидером
    if data.clan_id is not None:
        taken = await db.execute(
            select(User).where(User.clan_id == data.clan_id, User.id != user_id)
        )
        if taken.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="У этого клана уже есть лидер",
            )

    user.clan_id = data.clan_id
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user
