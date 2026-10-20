import asyncio
import sys
from pathlib import Path
import httpx
import uuid

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.config import settings
from app.main import app


async def test_full_api():
    print("[*] Запуск тестов API RustexClans...")

    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url="http://testserver",
    ) as client:
        # 1. Health check
        res = await client.get("/api/v1/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        data = res.json()
        assert data["status"] == "ok"
        print("[OK] Health check: 200 OK")

        # 2. Frontend bundle check
        res = await client.get("/")
        assert res.status_code == 200, f"Frontend root failed: {res.text}"
        assert "html" in res.headers.get("content-type", "")
        print("[OK] Frontend: Сервер раздает клиент на / (200 OK, index.html)")

        # 3. Leaderboard query
        res = await client.get("/api/v1/leaderboard")
        assert res.status_code == 200, f"Leaderboard failed: {res.text}"
        ladder = res.json()
        print(f"[OK] Leaderboard: получен список ({len(ladder)} кланов).")

        # 4. Auth login
        res = await client.post(
            "/api/v1/auth/login",
            json={"username": "thund3r", "password": "zzOZb63cBq9e9eNm"},
        )
        assert res.status_code == 200, f"Admin login failed: {res.text}"
        token = res.json()["access_token"]
        auth_headers = {"Authorization": f"Bearer {token}"}
        print("[OK] Auth: Успешный вход супер-админа, токен получен.")

        # 5. Проверка /me
        res = await client.get("/api/v1/auth/me", headers=auth_headers)
        assert res.status_code == 200
        assert res.json()["username"] == "thund3r"
        print("[OK] Auth: GET /api/v1/auth/me вернул профиль администратора.")

        # 6. Uploads - загрузка мок-файла логотипа
        mock_png = (
            b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4"
            b"\x00\x00\x00\rIDATx\x9cc`\x00\x00\x00\x02\x00\x01H\xaf\xa4q\x00\x00\x00\x00IEND\xaeB`\x82"
        )
        files = {"file": ("test_logo.png", mock_png, "image/png")}
        res = await client.post("/api/v1/uploads/logo", files=files, headers=auth_headers)
        assert res.status_code == 200, f"Upload failed: {res.text}"
        uploaded_logo_url = res.json()["url"]
        assert uploaded_logo_url.startswith("/uploads/"), "Uploaded URL must start with /uploads/"
        print(f"[OK] Uploads: Файл логотипа успешно загружен -> {uploaded_logo_url}")

        # 7. Создание тестового клана с ростером (0 CRL)
        unique_tag = f"T_{uuid.uuid4().hex[:4].upper()}"
        new_clan_payload = {
            "name": f"Test Clan {unique_tag}",
            "tag": unique_tag,
            "description": "Тестовый клан для проверки API",
            "roster": "TestLeader, TestSniper",
            "logo_url": uploaded_logo_url,
            "initial_points": 0,
        }
        res = await client.post("/api/v1/clans", json=new_clan_payload, headers=auth_headers)
        assert res.status_code == 201, f"Clan create failed: {res.text}"
        created_clan = res.json()
        clan_id = created_clan["id"]
        assert created_clan["points"] == 0, f"Initial points must be 0: {created_clan['points']}"
        assert created_clan["members"] == ["TestLeader", "TestSniper"], f"Roster mismatch: {created_clan['members']}"
        print(f"[OK] Clans: Тестовый клан [{unique_tag}] с 0 CRL создан.")

        # 8. Детализация клана и история
        res = await client.get(f"/api/v1/clans/{clan_id}")
        assert res.status_code == 200
        clan_detail = res.json()
        assert "members" in clan_detail
        print(f"[OK] Clan detail: [{clan_detail['tag']}] участников: {len(clan_detail['members'])}")

        res = await client.get(f"/api/v1/clans/{clan_id}/history")
        assert res.status_code == 200
        history = res.json()
        print(f"[OK] Clan history: записей аудита: {len(history)}")

        # 9. Изменение рейтинга модератором (+10 CRL)
        adj_payload = {
            "delta": 10,
            "reason": "Победа в онлайн-рейде над кланом выше в рейтинге (+10 CRL)",
            "proof_url": "https://youtube.com/watch?v=test-proof",
        }
        res = await client.post(
            f"/api/v1/clans/{clan_id}/adjust-rating",
            json=adj_payload,
            headers=auth_headers,
        )
        assert res.status_code == 200, f"Adjust rating failed: {res.text}"
        updated_clan = res.json()
        assert updated_clan["points"] == 10
        print(f"[OK] Adjust rating: [{updated_clan['tag']}] начислено +10 CRL -> {updated_clan['points']} CRL")

        # 10. Очистка тестовых данных (удаление тестового клана и файла)
        del_res = await client.delete(f"/api/v1/clans/{clan_id}", headers=auth_headers)
        assert del_res.status_code == 200
        file_to_del = backend_dir / uploaded_logo_url.lstrip("/")
        if file_to_del.exists():
            file_to_del.unlink()
        print("[OK] Cleanup: Тестовый клан и временный файл удалены. База оставлена чистой.")

    print("[SUCCESS] Все тесты API успешно пройдены! Бэкенд на 100% готов к работе.")


if __name__ == "__main__":
    asyncio.run(test_full_api())
