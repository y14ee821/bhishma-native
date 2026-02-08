from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List
from datetime import datetime
from bson import ObjectId
from app.database import get_database
from app.models.device import DeviceCreate, DeviceUpdate, DeviceResponse
from app.services.auth_service import verify_token

router = APIRouter()
security = HTTPBearer()

async def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Get current user ID from JWT token"""
    token = credentials.credentials
    payload = verify_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    return user_id

@router.post("/", response_model=DeviceResponse, status_code=status.HTTP_201_CREATED)
async def create_device(device: DeviceCreate, user_id: str = Depends(get_current_user_id)):
    """Create a new device for the current user"""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    
    # Create device document with user_id
    device_dict = device.dict()
    device_dict["user_id"] = user_id
    device_dict["created_at"] = datetime.utcnow()
    device_dict["updated_at"] = datetime.utcnow()
    
    result = await db.devices.insert_one(device_dict)
    
    # Fetch created device
    created_device = await db.devices.find_one({"_id": result.inserted_id})
    created_device["id"] = str(created_device["_id"])
    del created_device["_id"]
    
    return DeviceResponse(**created_device)

@router.get("/", response_model=List[DeviceResponse])
async def get_user_devices(user_id: str = Depends(get_current_user_id)):
    """Get all devices for the current authenticated user"""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    
    # Get only devices belonging to the current user
    query = {"user_id": user_id}
    
    devices = []
    async for device in db.devices.find(query):
        device["id"] = str(device["_id"])
        del device["_id"]
        devices.append(DeviceResponse(**device))
    
    return devices

@router.get("/{device_id}", response_model=DeviceResponse)
async def get_device(device_id: str, user_id: str = Depends(get_current_user_id)):
    """Get device by ID (only if it belongs to the current user)"""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    
    if not ObjectId.is_valid(device_id):
        raise HTTPException(status_code=400, detail="Invalid device ID")
    
    device = await db.devices.find_one({"_id": ObjectId(device_id), "user_id": user_id})
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    device["id"] = str(device["_id"])
    del device["_id"]
    
    return DeviceResponse(**device)

@router.put("/{device_id}", response_model=DeviceResponse)
async def update_device(device_id: str, device_update: DeviceUpdate, user_id: str = Depends(get_current_user_id)):
    """Update device by ID (only if it belongs to the current user)"""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    
    if not ObjectId.is_valid(device_id):
        raise HTTPException(status_code=400, detail="Invalid device ID")
    
    # Check if device exists and belongs to user
    existing_device = await db.devices.find_one({"_id": ObjectId(device_id), "user_id": user_id})
    if not existing_device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    # Prepare update data (only include provided fields, don't allow user_id change)
    update_data = {k: v for k, v in device_update.dict().items() if v is not None and k != "user_id"}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_data["updated_at"] = datetime.utcnow()
    
    await db.devices.update_one(
        {"_id": ObjectId(device_id), "user_id": user_id},
        {"$set": update_data}
    )
    
    # Fetch updated device
    updated_device = await db.devices.find_one({"_id": ObjectId(device_id)})
    updated_device["id"] = str(updated_device["_id"])
    del updated_device["_id"]
    
    return DeviceResponse(**updated_device)

@router.delete("/{device_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_device(device_id: str, user_id: str = Depends(get_current_user_id)):
    """Delete device by ID (only if it belongs to the current user)"""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    
    if not ObjectId.is_valid(device_id):
        raise HTTPException(status_code=400, detail="Invalid device ID")
    
    result = await db.devices.delete_one({"_id": ObjectId(device_id), "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Device not found")
    
    return None

