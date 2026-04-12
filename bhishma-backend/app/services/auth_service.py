from google.oauth2 import id_token
from google.auth.transport import requests
import jwt
from datetime import datetime, timedelta
import os
from typing import Optional, Dict
from app.database import get_database

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Google OAuth Configuration
# ID tokens from Android / iOS / web each use that platform's OAuth client id as JWT "aud".
# Set GOOGLE_CLIENT_ID to a comma-separated list of allowed client ids, and/or use the optional vars below.
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")


def _google_token_audiences() -> list[str]:
    raw = os.getenv("GOOGLE_CLIENT_ID", "")
    parts = [p.strip() for p in raw.split(",") if p.strip()]
    for key in ("GOOGLE_ANDROID_CLIENT_ID", "GOOGLE_IOS_CLIENT_ID", "GOOGLE_WEB_CLIENT_ID"):
        extra = os.getenv(key, "").strip()
        if extra and extra not in parts:
            parts.append(extra)
    return parts

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[Dict]:
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

async def verify_google_token(token: str) -> Optional[Dict]:
    """Verify Google ID token and return user info."""
    audiences = _google_token_audiences()
    if not audiences:
        raise ValueError(
            "Configure GOOGLE_CLIENT_ID (comma-separated allowed OAuth client ids) and/or "
            "GOOGLE_ANDROID_CLIENT_ID / GOOGLE_IOS_CLIENT_ID / GOOGLE_WEB_CLIENT_ID"
        )

    idinfo = None
    last_error: Optional[Exception] = None
    for aud in audiences:
        try:
            idinfo = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                aud,
            )
            break
        except (ValueError, Exception) as e:
            last_error = e
            idinfo = None
            continue

    if not idinfo:
        print(f"Token verification failed for all audiences ({len(audiences)}): {last_error}")
        return None

    try:
        if idinfo["iss"] not in ["accounts.google.com", "https://accounts.google.com"]:
            print("Token verification error: wrong issuer")
            return None

        return {
            "google_id": idinfo["sub"],
            "email": idinfo["email"],
            "name": idinfo.get("name", ""),
            "picture": idinfo.get("picture", ""),
        }
    except (KeyError, TypeError) as e:
        print(f"Token payload error: {e}")
        return None

async def get_or_create_user(google_user_info: Dict) -> Dict:
    """Get existing user or create new user from Google OAuth info"""
    db = get_database()
    if db is None:
        raise Exception("Database not connected")
    
    # Check if user exists by email or google_id
    existing_user = await db.users.find_one({
        "$or": [
            {"email": google_user_info['email']},
            {"google_id": google_user_info['google_id']}
        ]
    })
    
    if existing_user:
        # Update user with latest Google info if needed
        update_data = {
            "name": google_user_info['name'],
            "picture": google_user_info.get('picture'),
            "google_id": google_user_info['google_id'],
            "updated_at": datetime.utcnow()
        }
        
        await db.users.update_one(
            {"_id": existing_user["_id"]},
            {"$set": update_data}
        )
        
        # Fetch updated user
        updated_user = await db.users.find_one({"_id": existing_user["_id"]})
        updated_user["id"] = str(updated_user["_id"])
        del updated_user["_id"]
        if "password" in updated_user:
            del updated_user["password"]
        
        if "my_devices" not in updated_user:
            updated_user["my_devices"] = []
        
        return updated_user
    else:
        # Create new user
        new_user = {
            "name": google_user_info['name'],
            "email": google_user_info['email'],
            "google_id": google_user_info['google_id'],
            "picture": google_user_info.get('picture'),
            "my_devices": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await db.users.insert_one(new_user)
        created_user = await db.users.find_one({"_id": result.inserted_id})
        created_user["id"] = str(created_user["_id"])
        del created_user["_id"]
        if "password" in created_user:
            del created_user["password"]
        
        return created_user

