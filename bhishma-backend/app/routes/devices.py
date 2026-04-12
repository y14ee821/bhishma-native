from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List
from datetime import datetime
from bson import ObjectId
from app.database import get_database
from app.models.device import DeviceCreate, DeviceUpdate, DeviceResponse, userDeviceMap, userDeviceMapResponse, getDeviceResponse
from app.services.auth_service import verify_token
from app.utils.db_operations import DBOperations
from app.utils.logger import get_logger, log_error, log_db_operation

router = APIRouter()
security = HTTPBearer()
logger = get_logger("routes.devices")

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
    logger.info(f"Creating device '{device.name}' for user {user_id}")
    
    db = get_database()
    if db is None:
        logger.error("Database connection failed")
        raise HTTPException(status_code=500, detail="Database not connected")
    
    try:
        device_dict = device.dict()
        device_dict["user_id"] = user_id
        device_dict["created_at"] = datetime.utcnow()
        device_dict["updated_at"] = datetime.utcnow()
        
        result = await db.devices.insert_one(device_dict)
        log_db_operation("INSERT", "devices", True, {"device_id": str(result.inserted_id)})
        
        created_device = await db.devices.find_one({"_id": result.inserted_id})
        created_device["id"] = str(created_device["_id"])
        del created_device["_id"]
        
        logger.info(f"Device '{device.name}' created successfully with id {created_device['id']}")
        return DeviceResponse(**created_device)
    except Exception as e:
        log_error(e, {"user_id": user_id, "device_name": device.name})
        raise HTTPException(status_code=500, detail="Failed to create device")

@router.get("/", response_model=getDeviceResponse)
async def get_user_devices(user_id: str = Depends(get_current_user_id)):
    """Get all devices for the current authenticated user"""
    logger.info(f"Fetching devices for user {user_id}")
    
    db = get_database()
    if db is None:
        logger.error("Database connection failed")
        raise HTTPException(status_code=500, detail="Database not connected")
    
    try:
        db_operations = DBOperations(db)
        
        # Get user's device list
        user_data = await db_operations.find_one(
            collection="users", 
            query={"_id": ObjectId(user_id)},
            projection={"_id": 0, "my_devices": 1}
        )
        
        if user_data is None:
            logger.warning(f"User {user_id} not found")
            raise HTTPException(status_code=404, detail="User not found")
        
        user_device_ids = user_data.get("my_devices", [])
        logger.info(f"User has {len(user_device_ids)} mapped devices")
        
        devices = {}
        failed_devices = []
        
        for device_info in user_device_ids:
            device_id = device_info.get("device_id")
            device_name = device_info.get("device_name")
            
            device = await db_operations.find_one(
                collection="devices", 
                query={"_id": ObjectId(device_id)},
                projection={"_id": 0, "name": 1, "channels": 1}
            )
            
            if device is None:
                logger.warning(f"Device {device_name} ({device_id}) not found in database")
                failed_devices.append(device_name)
                continue
            
            device_name = device.get("name")
            channels_data = device.get("channels", [])
            device_response = {device_name: {"channels": channels_data,"device_id": device_id}}
            devices.update(device_response)
        
        if failed_devices:
            logger.warning(f"Failed to load {len(failed_devices)} devices: {failed_devices}")
        
        logger.info(f"Successfully retrieved {len(devices)} devices for user {user_id}")
        log_db_operation("QUERY", "devices", True, {
            "user_id": user_id, 
            "devices_count": len(devices),
            "failed_count": len(failed_devices)
        })
        
        return getDeviceResponse(data=devices)
        
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, {"user_id": user_id})
        raise HTTPException(status_code=500, detail="Failed to get user devices")


@router.get("/{device_id}", response_model=getDeviceResponse)
async def get_device(device_id: str, user_id: str = Depends(get_current_user_id)):
    """Get device by ID with channels (only if user has access)"""
    logger.info(f"User {user_id} requesting device {device_id}")
    
    db = get_database()
    if db is None:
        logger.error("Database connection failed")
        raise HTTPException(status_code=500, detail="Database not connected")
    
    if not ObjectId.is_valid(device_id):
        logger.warning(f"Invalid device ID format: {device_id}")
        raise HTTPException(status_code=400, detail="Invalid device ID")
    
    try:
        db_operations = DBOperations(db)
        
        # Find device by ID
        query_data = {"_id": ObjectId(device_id)}
        result = await db_operations.find_one(collection="devices", query=query_data)
        
        if not result:
            logger.warning(f"Device {device_id} not found")
            raise HTTPException(status_code=404, detail="Device not found")
        
        # Check if user has access to this device
        using_by = result.get("using_by", [])
        if user_id not in using_by:
            logger.warning(f"User {user_id} does not have access to device {device_id}")
            raise HTTPException(status_code=403, detail="Access denied: Device not mapped to user")
        
        # Extract device data
        device_name = result.get("name")
        channels_data = result.get("channels", [])
        
        # Build response in the format: {device_name: {"channels": [...]}}
        device_response = {device_name: {"channels": channels_data}}
        
        logger.info(f"Device {device_id} retrieved successfully for user {user_id}")
        return getDeviceResponse(data=device_response)
        
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, {"user_id": user_id, "device_id": device_id})
        raise HTTPException(status_code=500, detail="Failed to retrieve device")

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
@router.post("/map/userDevice", response_model=userDeviceMapResponse)
async def map_device(data: userDeviceMap, user_id: str = Depends(get_current_user_id)):
    """Map a device to a user by validating device name and security key"""
    mapping_data = data.dict()
    device_name = mapping_data.get("name")
    
    logger.info(f"Attempting to map device '{device_name}' to user {user_id}")
    
    try:
        db = get_database()    
        if db is None:
            logger.error("Database connection failed")
            raise HTTPException(status_code=500, detail="Database not connected")
        
        db_operations = DBOperations(db)
        
        query_data = {"name": device_name, "security_key": mapping_data.get("security_key")}
        result = await db_operations.find_one(collection="devices", query=query_data)
        
        if result is None:
            logger.warning(f"Device '{device_name}' not found or security key mismatch")
            return userDeviceMapResponse(
                device_name=device_name, 
                message="Device not found or invalid security key",
                success=False
            )
        if(result.get("using_by") is not None and user_id in result.get("using_by")):
            logger.warning(f"Device '{device_name}' already mapped to user {user_id}")
            return userDeviceMapResponse(
                device_name=device_name, 
                message="Device already mapped to user",
                success=False
            )
        
        device_id_str = str(result.get("_id"))
        device_name_id = {"device_name": device_name, "device_id": device_id_str}
        
        query_data_for_update_devices = {"_id": result.get("_id")}
        push_result_to_devices = await db_operations.modify_document(
            collection="devices",
            query=query_data_for_update_devices,
            operation_with_data={"$addToSet": {"using_by": user_id}}
        )
        
        if push_result_to_devices is False:
            logger.error(f"Failed to update device '{device_name}' with user {user_id}")
            return userDeviceMapResponse(
                device_name=device_name, 
                message="Failed to update device",
                success=False
            )
        
        log_db_operation("UPDATE", "devices", True, {"device_id": device_id_str, "operation": "add_user"})
        
        query_data_for_update_users = {"_id": ObjectId(user_id)}
        push_result_to_users = await db_operations.modify_document(
            collection="users",
            query=query_data_for_update_users,
            operation_with_data={"$addToSet": {"my_devices": device_name_id}}
        )
        
        if push_result_to_users is False:
            logger.error(f"Failed to update user {user_id} with device '{device_name}'")
            return userDeviceMapResponse(
                device_name=device_name, 
                message="Failed to update user",
                success=False
            )
        
        log_db_operation("UPDATE", "users", True, {"user_id": user_id, "operation": "add_device"})
        logger.info(f"Device '{device_name}' successfully mapped to user {user_id}")
        
        return userDeviceMapResponse(
            device_name=device_name, 
            message="Device mapped to user successfully",
            success=True
        )
        
    except Exception as e:
        log_error(e, {"user_id": user_id, "device_name": device_name})
        raise HTTPException(status_code=500, detail=f"Failed to map device: {str(e)}")
    
