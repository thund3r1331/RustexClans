import asyncio
import httpx

BASE_URL = "http://127.0.0.1:8000/api/v1"

async def test_roster_flow():
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
        print("[1] Логин под leader_titan...")
        l1_res = await client.post("/auth/login", json={"username": "leader_titan", "password": "password123"})
        assert l1_res.status_code == 200, f"Login failed: {l1_res.text}"
        titan_token = l1_res.json()["access_token"]
        titan_headers = {"Authorization": f"Bearer {titan_token}"}

        # Получаем данные о клане 1 и 2
        clans = (await client.get("/leaderboard")).json()
        titan_clan = next(c for c in clans if c["tag"] == "TITAN")
        blood_clan = next(c for c in clans if c["tag"] == "BLOOD")

        print(f"[2] Исходный состав TITAN: {titan_clan['members']}")

        print("[3] leader_titan обновляет состав своего клана (добавляет ники)...")
        new_roster = ["BeastLeader", "RustAimGod", "RocketMan", "NightFarmer", "NewSniper2026", "TurboBuilder"]
        update_res = await client.put(
            f"/clans/{titan_clan['id']}/roster",
            json={"members": new_roster},
            headers=titan_headers,
        )
        assert update_res.status_code == 200, f"Roster update failed: {update_res.text}"
        updated_clan = update_res.json()
        assert "NewSniper2026" in updated_clan["members"]
        assert len(updated_clan["members"]) == 6
        print(f"[OK] Обновленный состав: {updated_clan['members']}")

        print("[4] leader_titan удаляет ник из состава...")
        removed_roster = [m for m in updated_clan["members"] if m != "TurboBuilder"]
        del_res = await client.put(
            f"/clans/{titan_clan['id']}/roster",
            json={"members": removed_roster},
            headers=titan_headers,
        )
        assert del_res.status_code == 200
        assert "TurboBuilder" not in del_res.json()["members"]
        print(f"[OK] Состав после удаления: {del_res.json()['members']}")

        print("[5] leader_titan пытается изменить состав чужого клана (BLOOD)...")
        foreign_res = await client.put(
            f"/clans/{blood_clan['id']}/roster",
            json={"members": ["HackerNick"]},
            headers=titan_headers,
        )
        assert foreign_res.status_code == 403, f"Expected 403, got {foreign_res.status_code}: {foreign_res.text}"
        print("[OK] Доступ к чужому клану запрещен (403 Forbidden)")

        print("[6] Анонимный запрос на изменение состава...")
        anon_res = await client.put(
            f"/clans/{titan_clan['id']}/roster",
            json={"members": ["AnonNick"]},
        )
        assert anon_res.status_code == 401
        print("[OK] Анонимный доступ отклонен (401 Unauthorized)")

        print("[7] Админ меняет состав...")
        admin_login = await client.post("/auth/login", json={"username": "admin", "password": "rustex2026"})
        admin_headers = {"Authorization": f"Bearer {admin_login.json()['access_token']}"}
        admin_update = await client.put(
            f"/clans/{blood_clan['id']}/roster",
            json={"members": blood_clan["members"] + ["AdminApproved"]},
            headers=admin_headers,
        )
        assert admin_update.status_code == 200
        assert "AdminApproved" in admin_update.json()["members"]
        print("[OK] Администратор успешно обновил состав клана")

        print("\n--> [ALL ROSTER FLOW TESTS PASSED!]")
        return True

if __name__ == "__main__":
    asyncio.run(test_roster_flow())
