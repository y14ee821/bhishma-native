"""
Migration: Add my_devices field to all existing users
Run this once to update existing user documents
"""
import asyncio
from app.database import get_database

async def migrate_add_my_devices():
    """Add my_devices field to all users who don't have it"""
    db = get_database()
    if db is None:
        print("Error: Database not connected")
        return
    
    # Update all users that don't have my_devices field
    result = await db.users.update_many(
        {"my_devices": {"$exists": False}},
        {"$set": {"my_devices": []}}
    )
    
    print(f"Migration completed: Updated {result.modified_count} users")

if __name__ == "__main__":
    asyncio.run(migrate_add_my_devices())
