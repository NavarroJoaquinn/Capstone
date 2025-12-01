# auth-service/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import db  # tu módulo de conexión a Mongo
from routes.auth_routes import router as auth_router
#  ^^^ si tu carpeta se llama "routers" cámbialo a:
# from routers.auth_routes import router as auth_router

app = FastAPI(
    title="DataLens Auth Service",
    version="1.0.0",
)

# =========================
# CORS
# =========================
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.100.8:3000",  # 👈 la IP que sale en tu DevTools
    # si usas otra IP/LAN, la agregas aquí
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # durante desarrollo puedes usar ["*"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# RUTAS
# =========================
app.include_router(auth_router)


# =========================
# STARTUP / SHUTDOWN
# =========================
@app.on_event("startup")
async def _startup():
    print("[APP] Iniciando auth-service...")
    await db.init_mongo()
    print("[APP] Mongo listo.")


@app.on_event("shutdown")
async def _shutdown():
    print("[APP] Cerrando auth-service...")
    await db.close_mongo()
    print("[APP] Cerrado correctamente.")