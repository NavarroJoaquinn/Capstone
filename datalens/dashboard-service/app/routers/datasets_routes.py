"""Datasets API routes."""
from __future__ import annotations

from typing import Dict, Iterable, Optional

from fastapi import APIRouter, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.db import get_db
from app.models.dataset import DatasetMeta, PreviewResponse, SchemaResponse, StatsResponse
from app.services.datasets_service import (
    compute_basic_stats,
    get_dataset_meta,
    get_dataset_preview,
    infer_dataset_schema,
)
from app.utils.security import current_user


router = APIRouter(prefix="/datasets", tags=["datasets"])


@router.get("/{dataset_id}", response_model=DatasetMeta)
async def read_dataset(
    dataset_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: Dict = Depends(current_user),
) -> DatasetMeta:
    """Return dataset metadata for the requested dataset identifier."""

    return await get_dataset_meta(db, dataset_id)


@router.get("/{dataset_id}/preview", response_model=PreviewResponse)
async def read_dataset_preview(
    dataset_id: str,
    limit: int = Query(50, ge=1, description="Maximum number of rows to return"),
    offset: int = Query(0, ge=0, description="Number of rows to skip"),
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: Dict = Depends(current_user),
) -> PreviewResponse:
    """Return a preview of dataset rows using pagination."""

    return await get_dataset_preview(db, dataset_id, limit=limit, offset=offset)


@router.get("/{dataset_id}/schema", response_model=SchemaResponse)
async def read_dataset_schema(
    dataset_id: str,
    sample_size: int = Query(200, ge=10, description="Number of rows sampled for schema inference"),
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: Dict = Depends(current_user),
) -> SchemaResponse:
    """Infer and return dataset schema information."""

    return await infer_dataset_schema(db, dataset_id, sample_size=sample_size)


@router.get("/{dataset_id}/stats", response_model=StatsResponse)
async def read_dataset_stats(
    dataset_id: str,
    columns: Optional[str] = Query(
        None,
        description="Optional comma-separated list of columns to limit statistics to",
    ),
    sample_size: int = Query(10000, ge=100, description="Number of rows sampled for statistics"),
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: Dict = Depends(current_user),
) -> StatsResponse:
    """Return basic statistics for the dataset columns."""

    parsed_columns: Optional[Iterable[str]] = None
    if columns:
        parsed_columns = [column.strip() for column in columns.split(",") if column.strip()]

    return await compute_basic_stats(db, dataset_id, columns=parsed_columns, sample_size=sample_size)


# Example curl commands for manual testing:
# Metadatos
# curl -X GET "http://127.0.0.1:8002/datasets/<dataset_id>"
#
# Preview (50 filas)
# curl -X GET "http://127.0.0.1:8002/datasets/<dataset_id>/preview?limit=50&offset=0"
#
# Schema
# curl -X GET "http://127.0.0.1:8002/datasets/<dataset_id>/schema"
#
# Stats solo columnas numéricas (si agregas filtro):
# curl -X GET "http://127.0.0.1:8002/datasets/<dataset_id>/stats?columns=price,quantity"