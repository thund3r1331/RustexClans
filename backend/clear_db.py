import asyncio
from pathlib import Path
from sqlalchemy import select, delete
from app.database import AsyncSessionLocal, engine, Base
from app.models.clan import Clan
from app.models.player import Player
from app.models.rating_log import RatingLog
from app.models.user import User
from app.security import hash_password
from app.config import settings

async def clear_database():
    print("[*] Начинаем очистку базы данных...")

    # 0. Убеждаемся, что все таблицы созданы
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # 1. Очистка таблиц логов, игроков и кланов
    async with AsyncSessionLocal() as session:
        await session.execute(delete(RatingLog))
        await session.execute(delete(Player))
        await session.execute(delete(Clan))
        await session.commit()
        print("[OK] Таблицы кланов, игроков и журнала рейдов очищены.")

        # 2. Проверка / пересоздание администратора
        query = select(User).where(User.username == settings.SUPERUSER_USERNAME)
        admin_user = (await session.execute(query)).scalar_one_or_none()

        if not admin_user:
            admin_user = User(
                username=settings.SUPERUSER_USERNAME,
                hashed_password=hash_password(settings.SUPERUSER_PASSWORD),
                role="admin",
                is_active=True,
            )
            session.add(admin_user)
            await session.commit()
            print(f"[OK] Администратор '{settings.SUPERUSER_USERNAME}' создан.")
        else:
            print(f"[OK] Администратор '{settings.SUPERUSER_USERNAME}' сохранен.")

    # 3. Очистка папки uploads (кроме .gitkeep)
    uploads_dir = Path("backend/uploads")
    if uploads_dir.exists():
        for file in uploads_dir.iterdir():
            if file.name != ".gitkeep" and file.is_file():
                try:
                    file.unlink()
                    print(f"[OK] Удален файл: {file.name}")
                except Exception as e:
                    print(f"[WARN] Не удалось удалить {file.name}: {e}")

    await engine.dispose()
    print("[SUCCESS] База данных полностью очищена!")

if __name__ == "__main__":
    asyncio.run(clear_database())
