from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db, require_admin
from app.models.user import User
from app.schemas.auth import LoginRequest, Token, UserCreate, UserResponse
from app.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["Аутентификация"])


@router.post("/login", response_model=Token, summary="Вход для модераторов и админов")
async def login(login_data: LoginRequest, db: AsyncSession = Depends(get_db)):
    query = select(User).where(User.username == login_data.username)
    result = await db.execute(query)
    user = result.scalar_one_or_none()

    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверное имя пользователя или пароль",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Аккаунт деактивирован",
        )

    access_token = create_access_token(subject=user.username, role=user.role)
    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UserResponse, summary="Получить профиль текущего пользователя")
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/users", response_model=UserResponse, summary="Создать модератора (Только Admin)")
async def create_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    query = select(User).where(User.username == user_in.username)
    result = await db.execute(query)
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким именем уже существует",
        )

    new_user = User(
        username=user_in.username,
        hashed_password=hash_password(user_in.password),
        role=user_in.role,
        is_active=True,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user
