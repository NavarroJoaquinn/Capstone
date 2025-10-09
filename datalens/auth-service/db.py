import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

_client: AsyncIOMotorClient | None = None
db = None

# colecciones exportadas
users_col = None
datasets_col = None
analyses_col = None

async def init_mongo() -> None:
    """Conecta a Mongo y asegura índices básicos."""
    global _client, db, users_col, datasets_col, analyses_col

    try:
        print("[DB] Iniciando conexión a MongoDB...")
        mongo_uri = os.getenv("MONGO_URI")
        db_name = os.getenv("DB_NAME", "datalens")

        if not mongo_uri:
            raise RuntimeError("MONGO_URI no definido en .env")

        _client = AsyncIOMotorClient(mongo_uri)
        db = _client[db_name]

        # colecciones
        users_col = db["users"]
        datasets_col = db["datasets"]
        analyses_col = db["analyses"]

        # índices
        await users_col.create_index([("email", ASCENDING)], unique=True, name="email_1")
        await datasets_col.create_index([("user_id", ASCENDING)], name="user_id_1")
        await datasets_col.create_index([("status", ASCENDING)], name="status_1")
        await analyses_col.create_index([("dataset_id", ASCENDING)], name="dataset_id_1")
        await analyses_col.create_index([("type", ASCENDING), ("created_at", ASCENDING)], name="type_created_at_1")

        print(f"[DB] Conectado a MongoDB -> Base: {db_name}")
        print("[DB] Colecciones listas: users, datasets, analyses")

    except Exception as e:
        print(f"[DB][ERROR] No se pudo conectar: {e}")
        raise

async def close_mongo() -> None:
    global _client
    if _client is not None:
        _client.close()
        _client = None
        print("[DB] Conexión a MongoDB cerrada correctamente.")