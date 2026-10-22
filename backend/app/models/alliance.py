from datetime import datetime, timezone
from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Alliance(Base):
    __tablename__ = "alliances"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # Кто отправил запрос
    requester_clan_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("clans.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # Кому отправлен запрос
    target_clan_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("clans.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # pending | accepted | rejected
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Уникальная пара кланов (в одном направлении)
    __table_args__ = (
        UniqueConstraint("requester_clan_id", "target_clan_id", name="uq_alliance_pair"),
    )
