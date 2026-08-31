import os
from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import firebase_app, db

app = FastAPI(
    title="HyperTrack API",
    description="Backend API service for HyperTrack Application",
    version="1.0.0",
)

# Configure CORS for frontend access
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    os.getenv("FRONTEND_URL", "http://localhost:5173"),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Welcome to HyperTrack API",
        "docs": "/docs",
        "health": "/health",
    }

@app.get("/health")
async def health_check():
    firebase_status = "connected" if firebase_app is not None else "not_configured"
    firestore_status = "ready" if db is not None else "unavailable"
    
    return {
        "status": "healthy",
        "service": "HyperTrack Backend",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "firebase": {
            "app_initialized": firebase_status,
            "firestore": firestore_status,
        },
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
