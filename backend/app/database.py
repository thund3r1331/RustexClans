from collections.abc import AsyncGenerator
from sqlalchemy import event, text
from sqlalchemy.engine import Engine
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase
from app.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    # echo=True,
    connect_args={"check_same_thread": False},
)

@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    #print("configuring sqlite connection pragmas")
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.execute("PRAGMA synchronous=NORMAL")
    #print(f"journal_mode result -> {cursor.fetchone()}")
    cursor.close()
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)
class Base(DeclarativeBase):
    pass
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        # print(f"opened async session {id(session)}")
        try:
            yield session
        finally:
            # print(f"closed async session {id(session)}")
            await session.close()