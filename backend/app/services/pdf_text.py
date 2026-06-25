from __future__ import annotations

from io import BytesIO
from pypdf import PdfReader


class PdfReadError(Exception):
    pass


def extract_pdf_text(file_bytes: bytes, max_pages: int = 3) -> dict:
    try:
        reader = PdfReader(BytesIO(file_bytes))
    except Exception as exc:
        raise PdfReadError("CORRUPTED_PDF") from exc

    if reader.is_encrypted:
        raise PdfReadError("PASSWORD_PROTECTED_PDF")

    page_count = len(reader.pages)
    if page_count > max_pages:
        raise PdfReadError("TOO_MANY_PAGES")

    chunks: list[str] = []
    for page in reader.pages:
        try:
            chunks.append(page.extract_text() or "")
        except Exception:
            chunks.append("")

    text = "\n".join(chunks).strip()
    if len(text) < 120:
        raise PdfReadError("NO_EXTRACTABLE_TEXT")

    confidence = min(0.98, max(0.55, len(text) / 3500))
    return {
        "text": text,
        "page_count": page_count,
        "extraction_confidence": round(confidence, 2),
        "is_scanned": False,
        "warnings": [],
    }
