import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import users, devices, auth
from app.database import connect_to_mongo, close_mongo_connection

app = FastAPI(
    title="Bhishma API",
    description="Backend API for Bhishma Native App",
    version="1.0.0"
)

# CORS: read a comma-separated list from ALLOWED_ORIGINS (e.g. set in Render).
# Falls back to "*" for local dev. Note: when allow_origins=["*"],
# allow_credentials must be False per the CORS spec.
_raw_origins = os.getenv("ALLOWED_ORIGINS", "*").strip()
if _raw_origins == "*" or not _raw_origins:
    _allowed_origins = ["*"]
    _allow_credentials = False
else:
    _allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]
    _allow_credentials = True

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=_allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(devices.router, prefix="/api/devices", tags=["devices"])

# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()

@app.get("/")
async def root():
    return {"message": "Bhishma API is running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

