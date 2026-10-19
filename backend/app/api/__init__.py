from fastapi import APIRouter
from app.api.audit import router as audit_router
from app.api.auth import router as auth_router
from app.api.clans import router as clans_router
from app.api.leaderboard import router as leaderboard_router
from app.api.players import router as players_router
from app.api.uploads import router as uploads_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(clans_router)
api_router.include_router(players_router)
api_router.include_router(leaderboard_router)
api_router.include_router(audit_router)
api_router.include_router(uploads_router)
