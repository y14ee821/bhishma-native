from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from bson import ObjectId

class DeviceBase(BaseModel):
    name: str
    type: str
    status: str = "offline"
    user_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class DeviceCreate(DeviceBase):
    pass

class DeviceUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None
    user_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class DeviceResponse(BaseModel):
    id: str
    name: str
    type: str
    status: str
    user_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        json_encoders = {ObjectId: str}
class getDeviceResponse(BaseModel):
    data: Dict[str, Any]  # Format: {device_name: {"channels": [...]}}
    
    class Config:
        json_schema_extra = {
            "example": {
                "data": {
                    "Remcon": {
                        "channels": [
                            {"id": 1, "name": "Channel 1", "status": "on"},
                            {"id": 2, "name": "Channel 2", "status": "off"}
                        ]
                    }
                }
            }
        }
class userDeviceMap(BaseModel):
    name: str
    security_key: str
class userDeviceMapResponse(BaseModel):
    device_name: str
    message: str
    success: bool = False
