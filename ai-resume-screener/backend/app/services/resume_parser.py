import io
import re
from typing import Optional
from pypdf import PdfReader
from fastapi import HTTPException


class ResumeParserService:
    @staticmethod
    def extract_text(file_bytes: bytes, filename: str) -> str:
        """Extract clean text from PDF or TXT files."""
        if not file_bytes:
            raise HTTPException(status_code=400, detail="Invalid file")

        if filename.lower().endswith(".txt"):
            try:
                text = file_bytes.decode("utf-8")
            except UnicodeDecodeError:
                try:
                    text = file_bytes.decode("latin-1")
                except Exception as exc:  # pragma: no cover - defensive fallback
                    raise HTTPException(status_code=400, detail=f"Failed to decode TXT file: {exc}") from exc
            return "\n".join(line.strip() for line in text.splitlines() if line.strip())

        if filename.lower().endswith(".pdf"):
            try:
                stream = io.BytesIO(file_bytes)
                reader = PdfReader(stream)
                pages = [page.extract_text() or "" for page in reader.pages]
                text = "\n".join(page for page in pages if page).strip()
            except Exception as exc:  # pragma: no cover - defensive fallback
                raise HTTPException(status_code=400, detail=f"Failed to parse PDF file: {exc}") from exc

            if not text:
                raise HTTPException(status_code=400, detail="PDF file appears to be empty or unreadable")
            return text

        raise HTTPException(status_code=400, detail="Unsupported file format. Use PDF or TXT.")

    @staticmethod
    def extract_name(text: str) -> Optional[str]:
        raw_lines = [line.strip() for line in text.splitlines() if line.strip()]
        for line in raw_lines[:8]:
            lowered = line.lower()
            if len(line.split()) <= 4 and not re.search(r"(summary|experience|skills|education|profile|work|project|linkedin|github|email|phone)", lowered):
                candidate = re.sub(r"[^A-Za-z\s]", "", line).strip()
                if candidate and len(candidate.split()) <= 3 and not candidate.lower().startswith(("http", "linkedin", "github")):
                    return candidate.title()

        cleaned = re.sub(r"\s+", " ", text).strip()
        patterns = [
            r"\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b",
            r"\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b",
        ]
        for pattern in patterns:
            match = re.search(pattern, cleaned)
            if match:
                return match.group(1).strip()
        return None

    @staticmethod
    def extract_email(text: str) -> Optional[str]:
        match = re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text)
        return match.group(0).strip() if match else None

    @staticmethod
    def extract_phone(text: str) -> Optional[str]:
        match = re.search(r"(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}", text)
        return match.group(0).strip() if match else None

    @staticmethod
    def extract_experience(text: str) -> Optional[int]:
        years = re.findall(r"(\d+)\s*(?:years?|yrs?)", text, flags=re.IGNORECASE)
        if years:
            return int(max(years))

        if re.search(r"\b(3|4|5|6|7|8|9|10)\+?\s*(?:years?|yrs?)\b", text, flags=re.IGNORECASE):
            return int(re.search(r"\b(3|4|5|6|7|8|9|10)\+?\s*(?:years?|yrs?)\b", text, flags=re.IGNORECASE).group(1))

        return None
