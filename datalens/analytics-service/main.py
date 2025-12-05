from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv  # ⬅️ NUEVO

from db import init_mongo, close_mongo
from routers.analytics_routes import router as analytics_router

# Cargar variables del .env
load_dotenv()  # ⬅️ NUEVO

app = FastAPI(
    title="Analytics Service",
    version="1.0.0",
)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.100.8:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    await init_mongo()

@app.on_event("shutdown")
async def on_shutdown():
    await close_mongo()

app.include_router(analytics_router)
