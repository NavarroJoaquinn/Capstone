from fastapi import FastAPI
from dotenv import load_dotenv
from db import init_mongo, close_mongo
from routers import datasets_routes

load_dotenv()
app = FastAPI(title="dataset-service")

@app.on_event("startup")
async def _startup():
    await init_mongo()

@app.on_event("shutdown")
async def _shutdown():
    await close_mongo()

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/")
def root():
    return {"service": "dataset-service", "docs": "/docs", "health": "/health"}

app.include_router(datasets_routes.router)