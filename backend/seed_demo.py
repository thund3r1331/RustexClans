import asyncio
from datetime import datetime, timezone, timedelta
from app.database import AsyncSessionLocal, Base, engine
from app.models.clan import Clan
from app.models.rating_log import RatingLog
from app.services.ranking import recalculate_all_clan_ranks


async def seed():
    print("[*] Начинаем сидирование тестовых данных для RCL Rustex Remake...")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        from sqlalchemy import select
        existing = (await session.execute(select(Clan))).scalars().first()
        if existing:
            # Обновляем ростеры если они пустые
            clans = (await session.execute(select(Clan))).scalars().all()
            rosters = {
                "TITAN": "BeastLeader, RustAimGod, RocketMan, NightFarmer",
                "BLOOD": "VampireAK, BloodSniper, BoltyPro, Shadow",
                "RAGE": "FrostBite, IceBuilder, Blizzard, SnowLord",
                "MONEY": "ScrapTrader, SulfurKing, GoldDigger",
                "ZERGS": "SwarmCommander, NakedP250, Zergling",
                "SOLO": "LoneWolf, Nomad, Hermit",
            }
            for cl in clans:
                if cl.tag in rosters and not cl.roster:
                    cl.roster = rosters[cl.tag]
                if cl.logo_url and "dicebear" in cl.logo_url:
                    cl.logo_url = None
                if cl.description and "REmake" in cl.description:
                    cl.description = cl.description.replace("REmake", "Remake")
                if cl.description and "сервера Rustex" in cl.description:
                    cl.description = cl.description.replace("сервера Rustex", "игры Rustex")
            await session.commit()
            print("[INFO] База уже существует. Данные Rustex Remake обновлены.")
            return

        now = datetime.now(timezone.utc)

        clans_data = [
            {
                "name": "Titan Esports",
                "tag": "TITAN",
                "description": "Доминирующий клан игры Rustex Remake. Контроль Launch Site и карго.",
                "roster": "BeastLeader, RustAimGod, RocketMan, NightFarmer",
                "logo_url": None,
                "points": 1000,
                "previous_points": 990,
                "points_reached_at": now - timedelta(days=2),
                "tier": "Tier 1",
            },
            {
                "name": "BloodLine",
                "tag": "BLOOD",
                "description": "Агрессивный PVP-состав. Контроль Oil Rig и вылазки на бронепоезде.",
                "roster": "VampireAK, BloodSniper, BoltyPro, Shadow",
                "logo_url": None,
                "points": 1000,
                "previous_points": 995,
                "points_reached_at": now - timedelta(days=1),
                "tier": "Tier 1",
            },
            {
                "name": "Northern Rage",
                "tag": "RAGE",
                "description": "Снежный клан. Топ фермеры и строители неприступных бункеров в зимнем биоме.",
                "roster": "FrostBite, IceBuilder, Blizzard, SnowLord",
                "logo_url": None,
                "points": 780,
                "previous_points": 770,
                "points_reached_at": now - timedelta(hours=14),
                "tier": "Tier 1",
            },
            {
                "name": "Money Makers",
                "tag": "MONEY",
                "description": "Торговый синдикат. Контроль вендоров на Outpost и скупка ресурсов.",
                "roster": "ScrapTrader, SulfurKing, GoldDigger",
                "logo_url": None,
                "points": 640,
                "previous_points": 635,
                "points_reached_at": now - timedelta(days=3),
                "tier": "Tier 2",
            },
            {
                "name": "Zerg Rush 20",
                "tag": "ZERGS",
                "description": "Многочисленный состав новичков под предводительством опытных штурмовиков.",
                "roster": "SwarmCommander, NakedP250, Zergling",
                "logo_url": None,
                "points": 420,
                "previous_points": 415,
                "points_reached_at": now - timedelta(days=4),
                "tier": "Tier 2",
            },
            {
                "name": "Silent Solo Syndicate",
                "tag": "SOLO",
                "description": "Альянс соло-игроков и дуо для защиты от рейдов крупных кланов.",
                "roster": "LoneWolf, Nomad, Hermit",
                "logo_url": None,
                "points": 260,
                "previous_points": 255,
                "points_reached_at": now - timedelta(days=5),
                "tier": "Tier 2",
            },
        ]

        created_clans: list[Clan] = []
        for c in clans_data:
            clan = Clan(
                name=c["name"],
                tag=c["tag"],
                description=c.get("description"),
                roster=c.get("roster", ""),
                logo_url=c.get("logo_url"),
                points=c["points"],
                previous_points=c.get("previous_points", c["points"]),
                points_reached_at=c.get("points_reached_at", now),
                rank=0,
                rank_change=0,
                tier=c["tier"],
                is_active=True,
            )
            session.add(clan)
            created_clans.append(clan)

        await session.commit()
        for c in created_clans:
            await session.refresh(c)

        # 2. История изменений рейтинга
        logs = [
            RatingLog(
                clan_id=created_clans[0].id,
                old_points=990,
                new_points=1000,
                delta=10,
                reason="Победа в онлайн-рейде над кланом выше в рейтинге (+10 CRL)",
                proof_url="https://youtube.com/watch?v=rust-raid-demo-1",
                moderator_username="admin",
                created_at=now - timedelta(days=2),
            ),
            RatingLog(
                clan_id=created_clans[1].id,
                old_points=1000,
                new_points=990,
                delta=-10,
                reason="Поражение в онлайн-рейде клану ниже в рейтинге (-10 CRL)",
                proof_url="https://youtube.com/watch?v=rust-cargo-clash",
                moderator_username="admin",
                created_at=now - timedelta(days=1),
            ),
            RatingLog(
                clan_id=created_clans[2].id,
                old_points=770,
                new_points=780,
                delta=10,
                reason="Рекорд ракет при рейде (+10 CRL)",
                proof_url="https://imgur.com/gallery/heli-event-proof",
                moderator_username="admin",
                created_at=now - timedelta(hours=14),
            ),
        ]
        for l in logs:
            session.add(l)

        await session.commit()
        await recalculate_all_clan_ranks(session)
        print("[SUCCESS] Демо-данные Rustex Remake успешно синхронизированы!")


if __name__ == "__main__":
    asyncio.run(seed())
