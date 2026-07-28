from app.services.resume_parser import ResumeParserService


class TextExtractorService(ResumeParserService):
    """Backward-compatible wrapper around the parser service."""
    pass
