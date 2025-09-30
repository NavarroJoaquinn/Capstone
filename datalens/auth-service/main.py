from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv
from routers import auth_routes
import db as mongo  
from db import init_mongo, close_mongo

load_dotenv()
app = FastAPI(title="auth-service")

@app.on_event("startup")
async def _startup():
    await mongo.init_mongo()   

@app.on_event("shutdown")
async def _shutdown():
    await mongo.close_mongo() 

@app.get("/db/ping")
async def db_ping():
    try:
        if mongo.db is None:   
            raise RuntimeError("db es None (¿init_mongo no se ejecutó o MONGO_URI no está?)")
        ping = await mongo.db.command("ping")
        names = await mongo.db.list_collection_names()
        return {"ok": True, "ping": ping, "collections": names}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {e}")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/")
def root():
    return {"service": "auth-service", "docs": "/docs", "health": "/health"}

app.include_router(auth_routes.router)