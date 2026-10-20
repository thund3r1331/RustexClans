import shutil
import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.api.deps import require_moderator
from app.models.user import User

router = APIRouter(prefix="/uploads", tags=["Загрузка файлов"])

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


def is_valid_image(data: bytes, ext: str) -> bool:
    if len(data) < 12:
        return False
    if ext == ".png" and data.startswith(b"\x89PNG\r\n\x1a\n"):
        return True
    if ext in (".jpg", ".jpeg") and data.startswith(b"\xff\xd8\xff"):
        return True
    if ext == ".gif" and (data.startswith(b"GIF87a") or data.startswith(b"GIF89a")):
        return True
    if ext == ".webp" and data.startswith(b"RIFF") and data[8:12] == b"WEBP":
        return True
    return False


@router.post("/logo", summary="Загрузить файл логотипа клана (Модератор)")
async def upload_logo(
    file: UploadFile = File(...),
    _: User = Depends(require_moderator),
):
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Недопустимый формат файла '{ext}'. Разрешены только растровые изображения: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    # Читаем до MAX_FILE_SIZE + 1 байт для строгой проверки лимита
    content = await file.read(MAX_FILE_SIZE + 1)
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Файл слишком большой. Максимальный разрешенный размер: 5 МБ",
        )

    if not is_valid_image(content, ext):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Содержимое файла не соответствует заявленному формату изображения",
        )

    # Уникальное имя файла
    filename = f"clan_{uuid.uuid4().hex[:12]}{ext}"
    target_path = UPLOAD_DIR / filename

    try:
        target_path.write_bytes(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка сохранения файла: {e}",
        )

    return {"url": f"/uploads/{filename}"}
