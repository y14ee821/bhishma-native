"""
Logger Usage Examples
"""

from app.utils.logger import get_logger, log_request, log_error, log_db_operation

# Example 1: Basic usage in a module
logger = get_logger(__name__)

def example_function():
    logger.debug("Debug message")
    logger.info("Info message")
    logger.warning("Warning message")
    logger.error("Error message")
    logger.critical("Critical message")

# Example 2: In route handlers
async def some_endpoint(user_id: str):
    logger = get_logger("routes.devices")
    
    logger.info(f"User {user_id} accessing endpoint")
    log_request(user_id=user_id, endpoint="/api/devices", method="GET")
    
    try:
        # Your logic here
        result = {"status": "success"}
        logger.info(f"Operation completed for user {user_id}")
        return result
    except Exception as e:
        log_error(e, context={"user_id": user_id, "endpoint": "/api/devices"})
        raise

# Example 3: Database operations
async def db_example():
    logger = get_logger("database")
    
    try:
        # Before operation
        logger.info("Attempting to insert device")
        
        # Simulate DB operation
        result = await db.devices.insert_one({"name": "test"})
        
        # Log success
        log_db_operation(
            operation="INSERT",
            collection="devices",
            success=True,
            details={"device_id": str(result.inserted_id)}
        )
    except Exception as e:
        log_db_operation(
            operation="INSERT",
            collection="devices",
            success=False,
            details={"error": str(e)}
        )
        raise

# Example 4: Service layer
class DeviceService:
    def __init__(self):
        self.logger = get_logger("services.device")
    
    async def map_device(self, name: str, security_key: str, user_id: str):
        self.logger.info(f"Mapping device '{name}' for user {user_id}")
        
        try:
            # Your business logic
            self.logger.debug(f"Validating security key for device {name}")
            
            # Success
            self.logger.info(f"Device {name} successfully mapped to user {user_id}")
            return {"success": True}
        except Exception as e:
            self.logger.error(f"Failed to map device {name}: {str(e)}")
            log_error(e, context={"device": name, "user_id": user_id})
            raise
