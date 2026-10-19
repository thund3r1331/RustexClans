from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
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
    # 1. Автоматическое создание всех таблиц при старте
    async with engine.begin() as conn:
        # print("DEBUG [init]: creating all database tables...")
        await conn.run_sync(Base.metadata.create_all)

    # 2. Сидирование суперпользователя (если пользователей нет)
    async with AsyncSessionLocal() as session:
        query = select(User).where(User.username == settings.SUPERUSER_USERNAME)
        existing_admin = (await session.execute(query)).scalar_one_or_none()
        
        if not existing_admin:
            # print(f"DEBUG [init]: creating default admin '{settings.SUPERUSER_USERNAME}'...")
            admin_user = User(
                username=settings.SUPERUSER_USERNAME,
                hashed_password=hash_password(settings.SUPERUSER_PASSWORD),
                role="admin",
                is_active=True,
            )
            session.add(admin_user)
            await session.commit()
            print(f"[OK] Супер-администратор создан: login='{settings.SUPERUSER_USERNAME}', pass='{settings.SUPERUSER_PASSWORD}'")

        # 3. Пересчитываем ранги кланов
        await recalculate_all_clan_ranks(session)

    yield

    # Закрываем пул соединений при остановке
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Бэкенд соревновательного ладдера RustexClans (CRL)",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
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

# Статика фронтенда: раздаем сборку Vite (или fallback на HTML)
frontend_dir = Path(__file__).resolve().parent.parent.parent / "frontend"
dist_dir = frontend_dir / "dist"

if (dist_dir / "index.html").exists():
    assets_dir = dist_dir / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/", include_in_schema=False)
    async def serve_frontend():
        return FileResponse(str(dist_dir / "index.html"))
elif frontend_dir.exists():
    app.mount("/static", StaticFiles(directory=str(frontend_dir)), name="static")

    @app.get("/", include_in_schema=False)
    async def serve_frontend():
        index_file = frontend_dir / "index.html"
        if index_file.exists():
            return FileResponse(str(index_file))
        return {"status": "backend running", "docs": "/docs"}


@app.get("/health", tags=["Служебные"])
async def health_check():
    return {"status": "ok", "app": settings.PROJECT_NAME, "version": settings.VERSION}
