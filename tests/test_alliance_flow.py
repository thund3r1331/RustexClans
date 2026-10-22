import asyncio
import httpx

BASE_URL = "http://127.0.0.1:8000/api/v1"

async def test_full_flow():
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
        print("[1] Регистрация лидеров...")
        r1 = await client.post("/auth/register", json={"username": "leader_titan", "password": "password123"})
        if r1.status_code not in (200, 409):
            print("FAIL r1:", r1.status_code, r1.text)
            return False

        r2 = await client.post("/auth/register", json={"username": "leader_blood", "password": "password123"})
        if r2.status_code not in (200, 409):
            print("FAIL r2:", r2.status_code, r2.text)
            return False

        print("[2] Вход под admin...")
        admin_login = await client.post("/auth/login", json={"username": "admin", "password": "rustex2026"})
        assert admin_login.status_code == 200, f"Admin login failed: {admin_login.text}"
        admin_token = admin_login.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        print("[3] Получение списка кланов и лидеров администратором...")
        clans_res = await client.get("/leaderboard")
        clans = clans_res.json()
        assert len(clans) >= 2, "Недостаточно кланов в базе"
        titan_id = next(c["id"] for c in clans if c["tag"] == "TITAN")
        blood_id = next(c["id"] for c in clans if c["tag"] == "BLOOD")

        users_res = await client.get("/auth/users", headers=admin_headers)
        assert users_res.status_code == 200
        users = users_res.json()
        u_titan = next(u for u in users if u["username"] == "leader_titan")
        u_blood = next(u for u in users if u["username"] == "leader_blood")

        print("[4] Привязка лидеров к кланам через PATCH /auth/users/{id}/assign-clan...")
        p1 = await client.patch(f"/auth/users/{u_titan['id']}/assign-clan", json={"clan_id": titan_id}, headers=admin_headers)
        assert p1.status_code == 200, f"Assign titan failed: {p1.text}"
        p2 = await client.patch(f"/auth/users/{u_blood['id']}/assign-clan", json={"clan_id": blood_id}, headers=admin_headers)
        assert p2.status_code == 200, f"Assign blood failed: {p2.text}"

        print("[5] Вход под leader_titan...")
        l1_res = await client.post("/auth/login", json={"username": "leader_titan", "password": "password123"})
        t1_token = l1_res.json()["access_token"]
        t1_headers = {"Authorization": f"Bearer {t1_token}"}

        me1 = (await client.get("/auth/me", headers=t1_headers)).json()
        assert me1["clan_id"] == titan_id, f"Wrong clan_id for leader_titan: {me1}"

        print("[6] leader_titan отправляет запрос на альянс к BLOOD...")
        req_res = await client.post("/alliances/request", json={"target_clan_id": blood_id}, headers=t1_headers)
        assert req_res.status_code == 201, f"Alliance request failed: {req_res.text}"
        alliance_id = req_res.json()["id"]

        print("[7] Вход под leader_blood и проверка входящих...")
        l2_res = await client.post("/auth/login", json={"username": "leader_blood", "password": "password123"})
        t2_token = l2_res.json()["access_token"]
        t2_headers = {"Authorization": f"Bearer {t2_token}"}

        my_res = await client.get("/alliances/my", headers=t2_headers)
        my_allies = my_res.json()
        incoming = [a for a in my_allies if a["id"] == alliance_id and a["status"] == "pending"]
        assert len(incoming) == 1, f"Incoming request not found: {my_allies}"

        print("[8] leader_blood принимает запрос на альянс...")
        accept_res = await client.post(f"/alliances/{alliance_id}/accept", headers=t2_headers)
        assert accept_res.status_code == 200, f"Accept failed: {accept_res.text}"

        print("[9] Проверка публичного списка альянсов...")
        public_allies = (await client.get("/alliances/")).json()
        found = [a for a in public_allies if a["id"] == alliance_id and a["status"] == "accepted"]
        assert len(found) == 1, f"Alliance not in public list: {public_allies}"

        print("[10] Проверка альянсов конкретного клана...")
        clan_allies = (await client.get(f"/alliances/clan/{titan_id}")).json()
        assert len(clan_allies) == 1

        print("[11] leader_titan разрывает альянс (DELETE)...")
        del_res = await client.delete(f"/alliances/{alliance_id}", headers=t1_headers)
        assert del_res.status_code == 204, f"Delete failed: {del_res.text}"

        public_after = (await client.get("/alliances/")).json()
        assert not any(a["id"] == alliance_id for a in public_after)

        print("\n--> [ALL TESTS PASSED SUCCESSFULLY!]")
        return True

if __name__ == "__main__":
    asyncio.run(test_full_flow())
