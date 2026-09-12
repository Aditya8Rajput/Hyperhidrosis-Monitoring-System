import os
from pathlib import Path
from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables early
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")
load_dotenv()

from app.core.config import firebase_app, db
from app.routers.ai import router as ai_router

app = FastAPI(
    title="HyperTrack API",
    description="Backend API service for HyperTrack Application with Gemini AI telemetry intelligence",
    version="1.1.0",
)

# Configure CORS explicitly for frontend access
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    os.getenv("FRONTEND_URL", "http://localhost:5173"),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register AI router
app.include_router(ai_router, prefix="/api/ai", tags=["AI Telemetry & Intelligence"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to HyperTrack API",
        "docs": "/docs",
        "health": "/health",
        "ai_insights": "/api/ai/insights",
        "ai_chat": "/api/ai/chat"
    }

@app.get("/health")
async def health_check():
    firebase_status = "connected" if firebase_app is not None else "not_configured"
    firestore_status = "ready" if db is not None else "unavailable"
    gemini_status = "configured" if os.getenv("GEMINI_API_KEY") else "missing_key"
    
    return {
        "status": "healthy",
        "service": "HyperTrack Backend",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "firebase": {
            "app_initialized": firebase_status,
            "firestore": firestore_status,
        },
        "gemini_ai": {
            "status": gemini_status,
            "model": "gemini-2.5-flash / gemini-3.6-flash"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
