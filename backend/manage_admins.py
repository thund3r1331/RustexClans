import argparse
import asyncio
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import delete, select
from app.database import AsyncSessionLocal, engine, Base
from app.models.user import User
from app.security import hash_password


async def set_user(username: str, password: str, role: str = "admin"):
    async with AsyncSessionLocal() as session:
        query = select(User).where(User.username == username)
        user = (await session.execute(query)).scalar_one_or_none()

        hashed = hash_password(password)
        if user:
            user.hashed_password = hashed
            user.role = role
            user.is_active = True
            print(f"[OK] Пользователь '{username}' обновлен (role={role}).")
        else:
            user = User(
                username=username,
                hashed_password=hashed,
                role=role,
                is_active=True,
            )
            session.add(user)
            print(f"[OK] Создан пользователь '{username}' (role={role}).")

        await session.commit()


async def remove_user(username: str):
    async with AsyncSessionLocal() as session:
        res = await session.execute(delete(User).where(User.username == username))
        await session.commit()
        print(f"[OK] Удален пользователь '{username}' (строк: {res.rowcount}).")


async def list_users():
    async with AsyncSessionLocal() as session:
        res = await session.execute(select(User))
        users = res.scalars().all()
        print("\n--- СПИСОК ПОЛЬЗОВАТЕЛЕЙ В БАЗЕ ДАННЫХ ---")
        for u in users:
            print(f"- id={u.id}, login='{u.username}', role='{u.role}', active={u.is_active}")


async def main():
    parser = argparse.ArgumentParser(description="Управление администраторами и пользователями RustexClans")
    parser.add_argument("--set", nargs=2, metavar=("USERNAME", "PASSWORD"), help="Создать или обновить пароль пользователя")
    parser.add_argument("--role", default="admin", help="Роль (admin или moderator)")
    parser.add_argument("--remove", metavar="USERNAME", help="Удалить пользователя по логину")
    parser.add_argument("--list", action="store_true", help="Показать список всех пользователей")

    args = parser.parse_args()

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    if args.set:
        await set_user(args.set[0], args.set[1], args.role)
    elif args.remove:
        await remove_user(args.remove)
    elif args.list:
        await list_users()
    else:
        await list_users()

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
