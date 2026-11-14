"""
SPHEREx EXPLORER — Main FastAPI Application Entry Point.
NASA Space Apps Challenge 2026.
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as api_router
from app.database.db import init_db

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("spherex.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database & Cache
    logger.info("Initializing COSMOSCOPE Backend...")
    init_db()
    logger.info("Database initialized with seed challenge targets.")
    yield
    # Shutdown
    logger.info("Shutting down COSMOSCOPE Backend.")

app = FastAPI(
    title="COSMOSCOPE API — Explore the changing universe",
    description="Scientific discovery platform for exploring NASA's SPHEREx mission data, multi-epoch observations, 102-band spectroscopy, and celestial anomalies.",
    version="2.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend applications
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(api_router)

@app.get("/")
def root():
    return {
        "message": "Welcome to COSMOSCOPE API — Explore the changing universe",
        "docs_url": "/docs",
        "mission": "NASA SPHEREx (0.75 - 5.0 µm All-Sky Spectral Survey)",
        "competition": "NASA Space Apps Challenge 2026",
        "status": "operational"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
