from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection
client: AsyncIOMotorClient = None
database = None

async def connect_to_mongo():
    """Connect to MongoDB"""
    global client, database
    try:
        mongodb_uri = os.getenv("MONGODB_URI")
        database_name = os.getenv("DATABASE_NAME", "bhishma_db")
        
        if not mongodb_uri:
            raise ValueError("MONGODB_URI not found in environment variables")
        
        client = AsyncIOMotorClient(mongodb_uri)
        # Test connection
        await client.admin.command('ping')
        database = client[database_name]
        print(f"✅ Connected to MongoDB: {database_name}")
    except ConnectionFailure as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        raise
    except Exception as e:
        print(f"❌ Error connecting to MongoDB: {e}")
        raise

async def close_mongo_connection():
    """Close MongoDB connection"""
    global client
    if client:
        client.close()
        print("🔌 MongoDB connection closed")

def get_database():
    """Get database instance"""
    return database

