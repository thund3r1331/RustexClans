from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select

from app.api import api_router
from app.config import settings
from app.database import AsyncSessionLocal, Base, engine
from app.models.user import User
from app.security import hash_password
from app.services.ranking import recalculate_all_clan_ranks


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Автоматическое создание всех таблиц при старте (если не созданы)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # 2. Пересчитываем ранги кланов
    async with AsyncSessionLocal() as session:
        await recalculate_all_clan_ranks(session)

    yield

    # Закрываем пул соединений при остановке
    await engine.dispose()


# Общедоступное API (Swagger / ReDoc / OpenAPI JSON) полностью отключено
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Бэкенд соревновательного ладдера RustexClans (CRL)",
    lifespan=lifespan,
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключение API роутов
app.include_router(api_router, prefix=settings.API_V1_STR)

# Директория загруженных файлов (логотипы)
uploads_dir = Path(__file__).resolve().parent.parent / "uploads"
uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

# Статика фронтенда: надежная раздача Vite сборки и полноценный SPA fallback
def find_dist_dir() -> Path:
    candidates = [
        Path(__file__).resolve().parent.parent.parent / "frontend" / "dist",
        Path.cwd() / "frontend" / "dist",
        Path.cwd().parent / "frontend" / "dist",
        Path("/opt/rustexclans/frontend/dist"),
    ]
    for c in candidates:
        if (c / "index.html").exists():
            return c
    return candidates[0]

dist_dir = find_dist_dir()
dist_index = dist_dir / "index.html"
assets_dir = dist_dir / "assets"

if assets_dir.exists():
    app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    fav = dist_dir / "favicon.ico"
    if fav.exists():
        return FileResponse(str(fav))
    return Response(content=b"", media_type="image/x-icon")

@app.get("/health", tags=["Служебные"])
@app.get("/api/v1/health", tags=["Служебные"])
async def health_check():
    return {"status": "ok", "app": settings.PROJECT_NAME, "version": settings.VERSION}

@app.get("/", include_in_schema=False)
async def serve_root():
    if dist_index.exists():
        return FileResponse(str(dist_index))
    raise HTTPException(status_code=404, detail="Frontend dist not found. Run 'npm run build'")

@app.get("/{full_path:path}", include_in_schema=False)
async def serve_spa_fallback(full_path: str):
    if (
        full_path.startswith("api/")
        or full_path.startswith("uploads/")
        or full_path.startswith("assets/")
        or full_path in ["docs", "redoc", "openapi.json", "health", "favicon.ico", "robots.txt"]
    ):
        raise HTTPException(status_code=404, detail="Not Found")

    if dist_index.exists():
        return FileResponse(str(dist_index))
    raise HTTPException(status_code=404, detail="Frontend dist not found")
