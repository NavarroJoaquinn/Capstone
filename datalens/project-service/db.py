import motor.motor_asyncio
import os

mongo_client = None
db = None
projects_col = None

async def init_mongo():
    global mongo_client, db, projects_col

    mongo_uri = os.getenv("MONGO_URI")
    mongo_db = os.getenv("MONGO_DB", "datalens")

    mongo_client = motor.motor_asyncio.AsyncIOMotorClient(mongo_uri)
    db = mongo_client[mongo_db]

    projects_col = db["projects"]
    print("MongoDB connected (project-service)")

async def close_mongo():
    mongo_client.close()