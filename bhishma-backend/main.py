from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import users, devices, auth
from app.database import connect_to_mongo, close_mongo_connection

app = FastAPI(
    title="Bhishma API",
    description="Backend API for Bhishma Native App",
    version="1.0.0"
)

# CORS middleware - allow React Native app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your React Native app URL
    allow_credentials=True,
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

