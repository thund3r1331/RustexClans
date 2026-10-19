from datetime import datetime, timezone
from typing import TYPE_CHECKING
from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.clan import Clan


class Player(Base):
    __tablename__ = "players"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nickname: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    steam_id: Mapped[str] = mapped_column(String(30), unique=True, index=True, nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    
    # Роль в клане: "leader", "member", "recruit", "substitute"
    role_in_clan: Mapped[str] = mapped_column(String(20), default="member", nullable=False)

    clan_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("clans.id", ondelete="SET NULL"),
        nullable=True,
    )
    clan: Mapped["Clan | None"] = relationship("Clan", back_populates="players")

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # def __repr__(self) -> str:
    #     return f"<Player id={self.id} nick='{self.nickname}' steam={self.steam_id} clan_id={self.clan_id}>"
