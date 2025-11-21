import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING
from gridfs import GridFSBucket
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

_client: AsyncIOMotorClient | None = None
db = None
datasets_col = None
analyses_col = None
fs_bucket: GridFSBucket | None = None


async def init_mongo() -> None:
    global _client, db, datasets_col, analyses_col, fs_bucket

    mongo_uri = os.getenv("MONGO_URI")
    db_name = os.getenv("DB_NAME", "datalens")

    if not mongo_uri:
        raise RuntimeError("MONGO_URI no definido en .env")

    print("[DB] Conectando a Mongo desde dataset-service...")

    # Cliente Motor (async)
    _client = AsyncIOMotorClient(mongo_uri)
    db = _client[db_name]

    # Colecciones
    datasets_col = db["datasets"]
    analyses_col = db["analyses"]

    # Índices
    await datasets_col.create_index([("user_email", ASCENDING)], name="user_email_1")
    await datasets_col.create_index([("status", ASCENDING)], name="status_1")

    # GridFSBucket usando delegate
    # motor -> pymongo bridge
    fs_bucket = GridFSBucket(db.delegate)

    print("[DB] Mongo conectado correctamente (Motor + GridFS listo).")


async def close_mongo() -> None:
    global _client
    if _client is not None:
        _client.close()
        _client = None
        print("[DB] dataset-service cerró conexión Mongo")