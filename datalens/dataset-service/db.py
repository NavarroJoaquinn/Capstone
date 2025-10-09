import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

_client: AsyncIOMotorClient | None = None
db = None
datasets_col = None
analyses_col = None
fs_bucket = None  # GridFS bucket

async def init_mongo() -> None:
    """Conecta a Mongo y asegura índices básicos (datasets / analyses)."""
    global _client, db, datasets_col, analyses_col, fs_bucket

    mongo_uri = os.getenv("MONGO_URI")
    db_name = os.getenv("DB_NAME", "datalens")
    if not mongo_uri:
        raise RuntimeError("MONGO_URI no definido en .env")

    print("[DB] Conectando a Mongo desde dataset-service...")
    _client = AsyncIOMotorClient(mongo_uri)
    db = _client[db_name]

    # colecciones
    datasets_col = db["datasets"]
    analyses_col = db["analyses"]

    # índices útiles
    await datasets_col.create_index([("user_id", ASCENDING)], name="user_id_1")
    await datasets_col.create_index([("status", ASCENDING)], name="status_1")

    # GridFS (bucket por defecto: fs)
    # motor no tiene bucket nativo; usamos el de pymongo a través del cliente sync internamente
    from gridfs import GridFSBucket
    fs_bucket = GridFSBucket(db.delegate)  # db.delegate -> SyncDB para GridFS

    print("[DB] dataset-service conectado. Colecciones listas: datasets, analyses")

async def close_mongo() -> None:
    global _client
    if _client is not None:
        _client.close()
        _client = None
        print("[DB] dataset-service cerró conexión Mongo")