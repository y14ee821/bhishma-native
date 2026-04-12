from app.utils.logger import get_logger

class DataBaseExceptions(Exception):
    pass

class DBOperations:
    def __init__(self,db):
        self.db = db
        self.logger = get_logger(__name__)
        if self.db is None:
            self.logger.error("Database not connected")
            raise DataBaseExceptions("Database not connected")
    async def find_one(self, collection: str = None, query: dict = None, projection: dict = None):
        """
        Find a single document in a collection
        
        Args:
            collection: Collection name
            query: Query filter
            projection: Optional projection to include/exclude fields (None = return all fields)
        
        Returns:
            Document dict or None if not found
        """
        if collection is None:
            self.logger.error("Collection not provided")
            raise DataBaseExceptions("Collection not provided")
        if query is None:
            self.logger.error("Query not provided")
            raise DataBaseExceptions("Query not provided")
        
        # If projection is provided, use it; otherwise return all fields
        if projection is not None:
            self.logger.debug(f"Using projection: {projection}")
            result = await self.db[collection].find_one(query, projection=projection)
        else:
            self.logger.debug("No projection specified, returning all fields")
            result = await self.db[collection].find_one(query)
        
        if result is None:
            self.logger.warning(f"No document found in {collection} with query {query}")
            return None
        
        self.logger.debug(f"Document found in {collection}")
        return result
    async def find_all(self, collection: str = None, query: dict = None, projection: dict = None):
        """
        Find all documents matching query in a collection
        
        Args:
            collection: Collection name
            query: Query filter
            projection: Optional projection to include/exclude fields (None = return all fields)
        
        Returns:
            Cursor object for iterating results
        """
        if collection is None:
            self.logger.error("Collection not provided")
            raise DataBaseExceptions("Collection not provided")
        if query is None:
            self.logger.error("Query not provided")
            raise DataBaseExceptions("Query not provided")
        
        # If projection is provided, use it; otherwise return all fields
        if projection is not None:
            self.logger.debug(f"Finding documents with projection: {projection}")
            result = self.db[collection].find(query, projection=projection)
        else:
            self.logger.debug("Finding documents without projection")
            result = self.db[collection].find(query)
        
        return result
    async def modify_document(self,collection:str = None,query:dict = None,operation_with_data:str = None):
        if collection is None or query is None or operation_with_data is None:
            self.logger.error("Collection, query or data not provided")
            raise DataBaseExceptions("Collection, query or data not provided")
        self.logger.info(f"Modifying document in collection {collection} with query {query} and operation {operation_with_data}")
        try:
            result = await self.db[collection].update_one(query,operation_with_data)
            if result.matched_count == 0:
                self.logger.error("No document found")
                return False                
            return True
        except Exception as e:
            self.logger.error(e)
            raise DataBaseExceptions(str(e))
    
            
