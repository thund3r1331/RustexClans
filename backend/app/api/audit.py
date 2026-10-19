from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_db
from app.models.rating_log import RatingLog
from app.schemas.rating import RatingLogResponse

router = APIRouter(prefix="/audit", tags=["История рейдов и логи"])


@router.get("/rating-logs", response_model=list[RatingLogResponse], summary="История всех изменений рейтинга")
async def list_rating_logs(
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(RatingLog)
        .order_by(RatingLog.created_at.desc())
        .limit(limit)
    )
    result = await db.execute(query)
    return result.scalars().all()
