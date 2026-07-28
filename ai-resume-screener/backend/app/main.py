from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.database import Base, engine, initialize_database
from app.routers import candidates, jobs, resumes

# Initialize Schema constraints into transactional database context mapping models
initialize_database()


def create_app() -> FastAPI:
    app = FastAPI(
        title="AI Resume Screener Engine API",
        version="1.0.0",
        docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
        redoc_url=None,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Active Route Infrastructure Mount Matrix Points
    app.include_router(jobs.router, prefix="/api")
    app.include_router(resumes.router, prefix="/api")
    app.include_router(candidates.router, prefix="/api")

    @app.get("/health", tags=["Health"])
    def health_check():
        return {"status": "healthy", "environment": settings.ENVIRONMENT}

    @app.get("/")
    def read_root():
        return {"status": "healthy", "message": "AI Resume Screener API is running"}

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.ENVIRONMENT != "production",
        app_dir=".",
    )
