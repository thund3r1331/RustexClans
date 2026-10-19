import os
import uvicorn

if __name__ == "__main__":
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))
    is_dev = os.getenv("ENV", "development").lower() == "development"
    print(f"[*] Запуск RustexClans Backend на http://{host}:{port} (reload={is_dev})")
    print(f"[*] Swagger UI документация: http://{host}:{port}/docs")
    uvicorn.run("app.main:app", host=host, port=port, reload=is_dev)
