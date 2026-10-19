from datetime import datetime, timezone
from typing import TYPE_CHECKING
from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.player import Player
    from app.models.rating_log import RatingLog


class Clan(Base):
    __tablename__ = "clans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    tag: Mapped[str] = mapped_column(String(15), index=True, nullable=False)  # например [TITAN]
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    roster: Mapped[str | None] = mapped_column(Text, default="", nullable=True)  # список ников через запятую
    logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    banner_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    discord_url: Mapped[str | None] = mapped_column(String(200), nullable=True)

    # Метрики рейтинга
    points: Mapped[int] = mapped_column(Integer, default=0, index=True, nullable=False)
    previous_points: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    points_reached_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    rank: Mapped[int] = mapped_column(Integer, default=0, index=True, nullable=False)   # 1, 2, 3...
    rank_change: Mapped[int] = mapped_column(Integer, default=0, nullable=False)        # +2, -1, 0 (дельта мест)
    tier: Mapped[str] = mapped_column(String(20), default="Tier 3", nullable=False)     # "Tier 1", "Tier 2", "Tier 3"

    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
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

    # Связи: игроки клана и логи изменения рейтинга
    players: Mapped[list["Player"]] = relationship(
        "Player",
        back_populates="clan",
        lazy="selectin",
    )
    rating_logs: Mapped[list["RatingLog"]] = relationship(
        "RatingLog",
        back_populates="clan",
        cascade="all, delete-orphan",
        order_by="desc(RatingLog.created_at)",
        lazy="selectin",
    )

    # def __repr__(self) -> str:
    #     return f"<Clan id={self.id} tag='{self.tag}' name='{self.name}' pts={self.points} rank=#{self.rank}>"
