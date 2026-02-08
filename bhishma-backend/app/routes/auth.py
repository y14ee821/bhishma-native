from fastapi import APIRouter, HTTPException, status, Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from pydantic import BaseModel
from app.services.auth_service import (
    verify_google_token,
    get_or_create_user,
    create_access_token,
    verify_token
)
from app.models.user import UserResponse, TokenResponse
from app.database import get_database
from bson import ObjectId

router = APIRouter()
security = HTTPBearer()

class GoogleTokenRequest(BaseModel):
    token: str

@router.post("/google", response_model=TokenResponse, status_code=status.HTTP_200_OK)
async def google_login(request: GoogleTokenRequest):
    """
    Authenticate user with Google ID token
    Client should send the Google ID token obtained from Google Sign-In
    """
    if not request.token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google token is required"
        )
    
    # Verify Google token
    try:
        google_user_info = await verify_google_token(request.token)
        if not google_user_info:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Google token"
            )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    
    # Get or create user
    user = await get_or_create_user(google_user_info)
    
    # Create JWT access token
    access_token = create_access_token(
        data={"sub": user["id"], "email": user["email"]}
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(**user)
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get current authenticated user
    """
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
    
    return UserResponse(**user)

@router.post("/verify", status_code=status.HTTP_200_OK)
async def verify_access_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Verify if access token is valid
    """
    token = credentials.credentials
    payload = verify_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    return {"valid": True, "user_id": payload.get("sub")}

