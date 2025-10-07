import os
from pymongo import MongoClient
from gridfs import GridFS

MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB = os.getenv("MONGO_DB", "datalens")

_client = None
_db = None
_fs = None

def get_db():
    global _client, _db
    if _db is None:
        if not MONGO_URI:
            raise RuntimeError("MONGO_URI no configurado en .env")
        _client = MongoClient(MONGO_URI)
        _db = _client[MONGO_DB]
    return _db

def get_fs(bucket: str = "fs"):
    """GridFS bucket por defecto 'fs'. Cambia bucket si separas artefactos ML."""
    global _fs
    if _fs is None:
        _fs = GridFS(get_db(), collection=bucket)
    return _fs