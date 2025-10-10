"""ASGI entrypoint for the dashboard service."""
from __future__ import annotations

import logging

from fastapi import FastAPI

from app.db import close_mongo, init_mongo
from app.routers.datasets_routes import router as datasets_router


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("dashboard-service")

app = FastAPI(title="Dashboard Service", version="0.1.0")


@app.on_event("startup")
async def _startup() -> None:
    logger.info("Starting dashboard service")
    await init_mongo()


@app.on_event("shutdown")
async def _shutdown() -> None:
    logger.info("Shutting down dashboard service")
    await close_mongo()


app.include_router(datasets_router)