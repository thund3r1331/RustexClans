from datetime import datetime, timedelta, timezone
from typing import Any
import bcrypt
import jwt

from app.config import settings


def hash_password(password: str) -> str:
    # bcrypt генерирует соль и хеш в один проход
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception as e:
        # print(f"DEBUG [security]: verify_password failed with error: {e}")
        return False


def create_access_token(
    subject: str | Any,
    role: str,
    expires_delta: timedelta | None = None,
) -> str:
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode: dict[str, Any] = {
        "sub": str(subject),
        "role": role,
        "exp": expire,
        "iat": now,
    }
    # print(f"DEBUG [jwt]: encoding payload {to_encode}")
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any] | None:
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        return payload
    except jwt.PyJWTError as e:
        # print(f"DEBUG [jwt]: decode error: {e}")
        return None
