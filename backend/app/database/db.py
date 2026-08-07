import asyncio
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from app.config.settings import settings

logger = logging.getLogger("quickbite")

class InMemoryCollection:
    """In-memory collection fallback when MongoDB server is not running."""
    def __init__(self, name):
        self.name = name
        self.data = []

    async def find_one(self, filter_dict=None):
        filter_dict = filter_dict or {}
        for item in self.data:
            match = True
            for k, v in filter_dict.items():
                if item.get(k) != v:
                    match = False
                    break
            if match:
                return dict(item)
        return None

    def find(self, filter_dict=None):
        filter_dict = filter_dict or {}
        res = []
        for item in self.data:
            match = True
            for k, v in filter_dict.items():
                if isinstance(v, dict) and "$in" in v:
                    if item.get(k) not in v["$in"]:
                        match = False
                        break
                elif item.get(k) != v:
                    match = False
                    break
            if match:
                res.append(dict(item))
        return InMemoryCursor(res)

    async def insert_one(self, doc):
        from bson import ObjectId
        if "_id" not in doc:
            doc["_id"] = str(ObjectId())
        elif isinstance(doc["_id"], ObjectId):
            doc["_id"] = str(doc["_id"])
        self.data.append(doc)
        class Result:
            inserted_id = doc["_id"]
        return Result()

    async def insert_many(self, docs):
        from bson import ObjectId
        ids = []
        for doc in docs:
            if "_id" not in doc:
                doc["_id"] = str(ObjectId())
            elif isinstance(doc["_id"], ObjectId):
                doc["_id"] = str(doc["_id"])
            self.data.append(doc)
            ids.append(doc["_id"])
        class Result:
            inserted_ids = ids
        return Result()

    async def update_one(self, filter_dict, update_dict):
        target = await self.find_one(filter_dict)
        if target:
            if "$set" in update_dict:
                for k, v in update_dict["$set"].items():
                    target[k] = v
            if "$inc" in update_dict:
                for k, v in update_dict["$inc"].items():
                    target[k] = target.get(k, 0) + v
            # update in array
            for idx, item in enumerate(self.data):
                if item.get("_id") == target.get("_id"):
                    self.data[idx] = target
                    break
        class Result:
            modified_count = 1 if target else 0
        return Result()

    async def delete_one(self, filter_dict):
        target = await self.find_one(filter_dict)
        if target:
            self.data = [item for item in self.data if item.get("_id") != target.get("_id")]
        class Result:
            deleted_count = 1 if target else 0
        return Result()

    async def delete_many(self, filter_dict=None):
        filter_dict = filter_dict or {}
        orig_len = len(self.data)
        if not filter_dict:
            self.data = []
        else:
            self.data = [item for item in self.data if any(item.get(k) != v for k, v in filter_dict.items())]
        class Result:
            deleted_count = orig_len - len(self.data)
        return Result()

    async def count_documents(self, filter_dict=None):
        filter_dict = filter_dict or {}
        cursor = self.find(filter_dict)
        items = await cursor.to_list(length=None)
        return len(items)

class InMemoryCursor:
    def __init__(self, data):
        self._data = data
        self._skip = 0
        self._limit = None
        self._sort = None

    def sort(self, key_or_list, direction=1):
        if isinstance(key_or_list, str):
            key = key_or_list
            reverse = (direction == -1)
        elif isinstance(key_or_list, list) and len(key_or_list) > 0:
            key, direction = key_or_list[0]
            reverse = (direction == -1)
        else:
            return self
        
        def sort_key(x):
            val = x.get(key, 0)
            return val if val is not None else 0

        self._data = sorted(self._data, key=sort_key, reverse=reverse)
        return self

    def skip(self, n):
        self._skip = n
        return self

    def limit(self, n):
        self._limit = n
        return self

    async def to_list(self, length=100):
        data = self._data[self._skip:]
        if self._limit is not None:
            data = data[:self._limit]
        if length is not None:
            data = data[:length]
        return data

class InMemoryDB:
    def __init__(self):
        self.collections = {}

    def __getitem__(self, name):
        if name not in self.collections:
            self.collections[name] = InMemoryCollection(name)
        return self.collections[name]

    def get_collection(self, name):
        return self[name]

class Database:
    client: AsyncIOMotorClient = None
    db = None
    is_fallback = False

db = Database()

async def connect_to_mongo():
    try:
        db.client = AsyncIOMotorClient(settings.MONGODB_URL, serverSelectionTimeoutMS=2000)
        # Test connection
        await db.client.admin.command('ping')
        db.db = db.client[settings.DATABASE_NAME]
        db.is_fallback = False
        logger.info(f"Connected successfully to MongoDB at {settings.MONGODB_URL}")
    except Exception as e:
        logger.warning(f"MongoDB connection failed: {e}. Falling back to resilient in-memory database store.")
        db.db = InMemoryDB()
        db.is_fallback = True

async def close_mongo_connection():
    if db.client:
        db.client.close()
        logger.info("MongoDB connection closed.")

def get_collection(collection_name: str):
    return db.db[collection_name]
