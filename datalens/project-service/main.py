from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from db import init_mongo, close_mongo
from routers import projects_routes

load_dotenv()

app = FastAPI(
    title="project-service",
    swagger_ui_parameters={"persistAuthorization": True},
)

# CORS
origins = ["http://localhost:3000", "http://127.0.0.1:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def _startup():
    await init_mongo()

@app.on_event("shutdown")
async def _shutdown():
    await close_mongo()

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(projects_routes.router)