from datetime import datetime, timezone
from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    # role: "admin" | "moderator" — старая система для модераторов
    # role: "clan_leader" — лидер клана, зарегистрировался сам, привязан к clan_id
    role: Mapped[str] = mapped_column(String(20), default="moderator", nullable=False)
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)

    # Привязка к клану (только для role=clan_leader, назначается admin'ом вручную)
    clan_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("clans.id", ondelete="SET NULL"),
        nullable=True,
        default=None,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
