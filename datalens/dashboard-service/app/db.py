"""MongoDB connection utilities for the dashboard service."""
from __future__ import annotations

import logging
from typing import AsyncIterator

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config import get_settings


logger = logging.getLogger("dashboard-service")

_mongo_client: AsyncIOMotorClient | None = None
_database: AsyncIOMotorDatabase | None = None


async def init_mongo() -> None:
    """Initialise the MongoDB client and cache the database reference."""

    global _mongo_client, _database
    settings = get_settings()
    logger.info("Connecting to MongoDB at %s", settings.mongo_uri)
    _mongo_client = AsyncIOMotorClient(settings.mongo_uri)
    _database = _mongo_client[settings.mongo_db]


async def close_mongo() -> None:
    """Close the MongoDB client if it has been initialised."""

    global _mongo_client, _database
    if _mongo_client is not None:
        logger.info("Closing MongoDB connection")
        _mongo_client.close()
    _mongo_client = None
    _database = None


async def get_db() -> AsyncIterator[AsyncIOMotorDatabase]:
    """FastAPI dependency that yields the active database instance."""

    if _database is None:
        raise RuntimeError("MongoDB has not been initialised; ensure init_mongo() is called.")
    yield _database