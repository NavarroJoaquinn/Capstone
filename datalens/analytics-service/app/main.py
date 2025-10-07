import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers.analytics_routes import router as analytics_router

app = FastAPI(
    title="analytics-service",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS opcional (lee de .env -> CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000)
origins_env = os.getenv("CORS_ORIGINS", "")
origins = [o.strip() for o in origins_env.split(",") if o.strip()]
if origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Rutas del servicio
app.include_router(analytics_router)

# Health root (opcional)
@app.get("/")
def root():
    return {"service": "analytics-service", "status": "ok"}