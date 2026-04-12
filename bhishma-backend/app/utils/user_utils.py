"""
Utility functions for user data processing
"""
from typing import Dict

def sanitize_user_response(user: Dict) -> Dict:
    """
    Sanitize user document for API response
    - Converts _id to id
    - Removes password
    - Ensures my_devices field exists
    
    Args:
        user: User document from MongoDB
    
    Returns:
        Sanitized user dictionary
    """
    if not user:
        return None
    
    # Convert _id to id
    if "_id" in user:
        user["id"] = str(user["_id"])
        del user["_id"]
    
    # Remove password
    if "password" in user:
        del user["password"]
    
    # Ensure my_devices exists
    if "my_devices" not in user:
        user["my_devices"] = []
    
    return user
