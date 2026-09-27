from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db, SessionLocal
from app.seeder import seed_qms_data
from app.api.routes import router as deviations_router
from app.api.routes_capas import router as capas_router
from app.api.routes_change_controls import router as change_controls_router
from app.api.routes_audits import router as audits_router
from app.api.routes_documents import router as documents_router
from app.api.routes_reports import router as reports_router

# Initialize database tables on startup
init_db()

# Seed initial demonstration data if tables are empty
try:
    with SessionLocal() as db_session:
        seed_qms_data(db_session)
except Exception as e:
    print(f"Warning: Seed data initialization skipped: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Enterprise-grade AI-Powered Deviation Intake Module for Pharmaceutical Quality Management Systems (QMS)."
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(deviations_router, prefix=settings.API_V1_PREFIX)
app.include_router(capas_router, prefix=settings.API_V1_PREFIX)
app.include_router(change_controls_router, prefix=settings.API_V1_PREFIX)
app.include_router(audits_router, prefix=settings.API_V1_PREFIX)
app.include_router(documents_router, prefix=settings.API_V1_PREFIX)
app.include_router(reports_router, prefix=settings.API_V1_PREFIX)

import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "ai_model": settings.GROQ_MODEL,
        "groq_configured": bool(settings.GROQ_API_KEY and settings.GROQ_API_KEY.strip()),
    }

# Production frontend SPA static serving
frontend_dist_candidates = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")),
    os.path.abspath("/app/frontend/dist"),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dist")),
]

dist_dir = None
for candidate in frontend_dist_candidates:
    if os.path.isdir(candidate) and os.path.exists(os.path.join(candidate, "index.html")):
        dist_dir = candidate
        break

if dist_dir:
    assets_dir = os.path.join(dist_dir, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/")
    def serve_index():
        return FileResponse(os.path.join(dist_dir, "index.html"))

    @app.get("/{full_path:path}")
    def serve_frontend_spa(full_path: str):
        if full_path.startswith("api/") or full_path == "api" or full_path in ["docs", "openapi.json", "redoc"]:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Not Found")
        
        target_file = os.path.join(dist_dir, full_path)
        if full_path and os.path.isfile(target_file):
            return FileResponse(target_file)
        return FileResponse(os.path.join(dist_dir, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "app": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "status": "operational",
            "docs_url": "/docs",
            "ai_model": settings.GROQ_MODEL,
            "has_groq_key": bool(settings.GROQ_API_KEY and settings.GROQ_API_KEY.strip())
        }
