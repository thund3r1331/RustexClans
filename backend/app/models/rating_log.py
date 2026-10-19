from datetime import datetime, timezone
from typing import TYPE_CHECKING
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.clan import Clan


class RatingLog(Base):
    __tablename__ = "rating_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    clan_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("clans.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    old_points: Mapped[int] = mapped_column(Integer, nullable=False)
    new_points: Mapped[int] = mapped_column(Integer, nullable=False)
    delta: Mapped[int] = mapped_column(Integer, nullable=False)  # +75, -50 и т.д.
    
    reason: Mapped[str] = mapped_column(Text, nullable=False)    # Причина / номер письма / описание рейда
    proof_url: Mapped[str | None] = mapped_column(String(500), nullable=True)  # Пруф (YouTube / imgur / диск)
    moderator_username: Mapped[str] = mapped_column(String(50), nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        index=True,
        nullable=False,
    )

    clan: Mapped["Clan"] = relationship("Clan", back_populates="rating_logs")

    # def __repr__(self) -> str:
    #     return f"<RatingLog clan_id={self.clan_id} delta={self.delta:+d} mod='{self.moderator_username}'>"
