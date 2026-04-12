from fastapi import APIRouter, HTTPException, status
from typing import List
from datetime import datetime
from bson import ObjectId
from app.database import get_database
from app.models.user import UserCreate, UserUpdate, UserResponse

router = APIRouter()

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate):
    """Create a new user"""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Create user document
    user_dict = user.dict()
    # Remove None values
    user_dict = {k: v for k, v in user_dict.items() if v is not None}
    user_dict["my_devices"] = []
    user_dict["created_at"] = datetime.utcnow()
    user_dict["updated_at"] = datetime.utcnow()
    
    result = await db.users.insert_one(user_dict)
    
    # Fetch created user
    created_user = await db.users.find_one({"_id": result.inserted_id})
    created_user["id"] = str(created_user["_id"])
    del created_user["_id"]
    if "password" in created_user:
        del created_user["password"]  # Don't return password
    if "my_devices" not in created_user:
        created_user["my_devices"] = []
    
    return UserResponse(**created_user)

@router.get("/", response_model=List[UserResponse])
async def get_all_users():
    """Get all users"""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    
    users = []
    async for user in db.users.find():
        user["id"] = str(user["_id"])
        del user["_id"]
        if "password" in user:
            del user["password"]
        if "my_devices" not in user:
            user["my_devices"] = []
        users.append(UserResponse(**user))
    
    return users

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str):
    """Get user by ID"""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user["id"] = str(user["_id"])
    del user["_id"]
    if "password" in user:
        del user["password"]
    if "my_devices" not in user:
        user["my_devices"] = []
    
    return UserResponse(**user)

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(user_id: str, user_update: UserUpdate):
    """Update user by ID"""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    # Check if user exists
    existing_user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prepare update data (only include provided fields)
    update_data = {k: v for k, v in user_update.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_data["updated_at"] = datetime.utcnow()
    
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data}
    )
    
    # Fetch updated user
    updated_user = await db.users.find_one({"_id": ObjectId(user_id)})
    updated_user["id"] = str(updated_user["_id"])
    del updated_user["_id"]
    if "password" in updated_user:
        del updated_user["password"]
    if "my_devices" not in updated_user:
        updated_user["my_devices"] = []
    
    return UserResponse(**updated_user)

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str):
    """Delete user by ID"""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    result = await db.users.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return None

