# analytics-service/db.py
import motor.motor_asyncio
import os

mongo_client = None
db = None
analyses_col = None

async def init_mongo():
    global mongo_client, db, analyses_col

    mongo_uri = os.getenv("MONGO_URI")
    mongo_db = os.getenv("DB_NAME", "datalens")  # ⬅️ cambiar MONGO_DB por DB_NAME

    mongo_client = motor.motor_asyncio.AsyncIOMotorClient(mongo_uri)
    db = mongo_client[mongo_db]

    analyses_col = db["analyses"]
    print("[DB] analytics-service conectado")

async def close_mongo():
    global mongo_client
    if mongo_client:
        mongo_client.close()
        print("[DB] analytics-service cerró conexión Mongo")