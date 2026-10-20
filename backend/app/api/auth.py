import asyncio
import time
from collections import defaultdict
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.auth import ChangePasswordRequest, LoginRequest, Token, UserResponse
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


@router.post("/login", response_model=Token, summary="Вход для модераторов и админов")
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
        # Искусственная задержка для предотвращения высокоскоростных атак
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

    # При успешном входе очищаем историю неудачных попыток
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
    return {"status": "ok", "message": "Пароль успешно изменен"}


@router.get("/me", response_model=UserResponse, summary="Получить профиль текущего пользователя")
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
