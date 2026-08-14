"""MongoDB Async Database Layer with Resilience, Schema Indexing, and Multi-Session Queries."""

import logging
import asyncio
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
import motor.motor_asyncio
from src.config import settings

logger = logging.getLogger("database")


class InMemoryAsyncCursor:
    """Async cursor emulation for in-memory collections."""

    def __init__(self, data: List[Dict[str, Any]]):
        self._data = data
        self._sort_key = None
        self._sort_direction = 1

    def sort(self, key: str, direction: int = 1):
        self._sort_key = key
        self._sort_direction = direction
        self._data.sort(
            key=lambda x: x.get(self._sort_key, ""),
            reverse=(self._sort_direction == -1),
        )
        return self

    async def to_list(self, length: Optional[int] = None) -> List[Dict[str, Any]]:
        if length is not None:
            return self._data[:length]
        return self._data


class InMemoryAsyncCollection:
    """Thread-safe in-memory collection fallback when MongoDB daemon is not reachable."""
    
    def __init__(self, name: str):
        self.name = name
        self._data: Dict[str, Dict[str, Any]] = {}
        self._lock = asyncio.Lock()

    async def create_index(self, keys: Any, unique: bool = False, **kwargs):
        """Mock create_index."""
        pass

    async def find_one(self, filter_dict: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        async with self._lock:
            for doc in self._data.values():
                match = True
                for k, v in filter_dict.items():
                    if doc.get(k) != v:
                        match = False
                        break
                if match:
                    return doc.copy()
            return None

    def find(self, filter_dict: Optional[Dict[str, Any]] = None) -> InMemoryAsyncCursor:
        filters = filter_dict or {}
        matched = []
        for doc in self._data.values():
            match = True
            for k, v in filters.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                matched.append(doc.copy())
        return InMemoryAsyncCursor(matched)

    async def insert_one(self, document: Dict[str, Any]):
        async with self._lock:
            doc_id = str(document.get("_id") or document.get("id") or document.get("email") or document.get("thread_id") or len(self._data) + 1)
            doc_copy = document.copy()
            doc_copy["_id"] = doc_id
            if "created_at" not in doc_copy:
                doc_copy["created_at"] = datetime.now(timezone.utc).isoformat()
            doc_copy["updated_at"] = datetime.now(timezone.utc).isoformat()
            self._data[doc_id] = doc_copy
            
            class Result:
                inserted_id = doc_id
            return Result()

    async def update_one(self, filter_dict: Dict[str, Any], update_dict: Dict[str, Any], upsert: bool = False):
        async with self._lock:
            target_id = None
            for doc_id, doc in self._data.items():
                match = True
                for k, v in filter_dict.items():
                    if doc.get(k) != v:
                        match = False
                        break
                if match:
                    target_id = doc_id
                    break

            if target_id:
                doc = self._data[target_id]
                if "$set" in update_dict:
                    doc.update(update_dict["$set"])
                else:
                    doc.update(update_dict)
                doc["updated_at"] = datetime.now(timezone.utc).isoformat()
            elif upsert:
                new_doc = filter_dict.copy()
                if "$set" in update_dict:
                    new_doc.update(update_dict["$set"])
                doc_id = str(new_doc.get("thread_id") or new_doc.get("email") or len(self._data) + 1)
                new_doc["_id"] = doc_id
                if "created_at" not in new_doc:
                    new_doc["created_at"] = datetime.now(timezone.utc).isoformat()
                new_doc["updated_at"] = datetime.now(timezone.utc).isoformat()
                self._data[doc_id] = new_doc


class DatabaseManager:
    """Manages Async MongoDB connection and resilient fallback."""
    
    def __init__(self):
        self.client: Optional[motor.motor_asyncio.AsyncIOMotorClient] = None
        self.db = None
        self.is_connected = False
        self._fallback_users = InMemoryAsyncCollection("users")
        self._fallback_workflows = InMemoryAsyncCollection("workflow_sessions")

    async def initialize(self):
        """Attempts to connect to MongoDB; falls back gracefully if server is unavailable."""
        try:
            self.client = motor.motor_asyncio.AsyncIOMotorClient(
                settings.mongodb_uri,
                serverSelectionTimeoutMS=2000,
            )
            # Test ping
            await self.client.admin.command('ping')
            self.db = self.client[settings.mongodb_db_name]
            self.is_connected = True
            logger.info(f"Connected to MongoDB at {settings.mongodb_uri}/{settings.mongodb_db_name}")
            
            # Ensure unique and query indexes
            await self.db.users.create_index("email", unique=True)
            await self.db.workflow_sessions.create_index("thread_id", unique=True)
            await self.db.workflow_sessions.create_index([("user_email", 1), ("created_at", -1)])
        except Exception as e:
            logger.warning(f"MongoDB connection to {settings.mongodb_uri} not available ({e}). Using resilient in-memory database store.")
            self.is_connected = False

    @property
    def users(self):
        if self.is_connected and self.db is not None:
            return self.db.users
        return self._fallback_users

    @property
    def workflows(self):
        if self.is_connected and self.db is not None:
            return self.db.workflow_sessions
        return self._fallback_workflows


db_manager = DatabaseManager()
