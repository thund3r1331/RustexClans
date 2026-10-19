import shutil
import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.api.deps import require_moderator
from app.models.user import User

router = APIRouter(prefix="/uploads", tags=["Загрузка файлов"])

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


@router.post("/logo", summary="Загрузить файл логотипа клана (Модератор)")
async def upload_logo(
    file: UploadFile = File(...),
    _: User = Depends(require_moderator),
):
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Недопустимый формат файла '{ext}'. Разрешены: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Уникальное имя файла
    filename = f"clan_{uuid.uuid4().hex[:12]}{ext}"
    target_path = UPLOAD_DIR / filename

    try:
        with target_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка сохранения файла: {e}",
        )

    return {"url": f"/uploads/{filename}"}
