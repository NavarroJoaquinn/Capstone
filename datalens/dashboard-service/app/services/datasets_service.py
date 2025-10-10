"""Business logic for dataset-related operations."""
from __future__ import annotations

import logging
from statistics import mean
from typing import Any, Dict, Iterable, List, Optional

from bson import ObjectId
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.config import get_settings
from app.models.dataset import (
    ColumnStats,
    DatasetMeta,
    NumericStats,
    PreviewResponse,
    SchemaField,
    SchemaResponse,
    StatsResponse,
)
from app.utils.parsing import infer_schema, is_numeric, sample_rows


logger = logging.getLogger("dashboard-service")

DATASET_COLLECTION = "datasets"
DATASET_ROWS_COLLECTION = "dataset_rows"


def _parse_dataset_id(dataset_id: str) -> ObjectId:
    try:
        return ObjectId(dataset_id)
    except Exception as exc:  # noqa: BLE001
        logger.error("Invalid dataset id: %s", dataset_id)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid dataset id") from exc


def _normalise_row(document: Dict[str, Any]) -> Dict[str, Any]:
    if "row" in document and isinstance(document["row"], dict):
        return document["row"]
    if "data" in document and isinstance(document["data"], dict):
        return document["data"]
    return {
        key: value
        for key, value in document.items()
        if key not in {"_id", "dataset_id", "datasetId", "dataset"}
    }


async def get_dataset_meta(db: AsyncIOMotorDatabase, dataset_id: str) -> DatasetMeta:
    """Return dataset metadata for the provided identifier."""

    object_id = _parse_dataset_id(dataset_id)
    projection = {
        "name": 1,
        "description": 1,
        "approxRowCount": 1,
        "rowCount": 1,
        "sizeInBytes": 1,
        "size": 1,
        "createdAt": 1,
        "updatedAt": 1,
        "uploadedAt": 1,
    }
    document = await db[DATASET_COLLECTION].find_one({"_id": object_id}, projection=projection)
    if document is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")

    approx_row_count = (
        document.get("approxRowCount")
        or document.get("rowCount")
        or document.get("rows")
        or document.get("count")
    )
    size_in_bytes = document.get("sizeInBytes") or document.get("size")
    meta = DatasetMeta(
        id=str(document.get("_id", object_id)),
        name=document.get("name"),
        description=document.get("description"),
        approx_row_count=approx_row_count,
        size_in_bytes=size_in_bytes,
        created_at=document.get("createdAt") or document.get("uploadedAt"),
        updated_at=document.get("updatedAt"),
    )
    return meta


def _dataset_match_filter(object_id: ObjectId, dataset_id: str) -> Dict[str, Any]:
    return {"$or": [{"dataset_id": object_id}, {"datasetId": dataset_id}]}


async def get_dataset_preview(
    db: AsyncIOMotorDatabase, dataset_id: str, limit: int, offset: int
) -> PreviewResponse:
    """Fetch a preview of the dataset rows."""

    settings = get_settings()
    if limit > settings.max_preview_rows:
        logger.debug("Limiting preview from %s to %s rows", limit, settings.max_preview_rows)
        limit = settings.max_preview_rows

    object_id = _parse_dataset_id(dataset_id)
    metadata = await db[DATASET_COLLECTION].find_one(
        {"_id": object_id}, projection={"sizeInBytes": 1, "size": 1}
    )
    if metadata:
        raw_size = metadata.get("sizeInBytes") or metadata.get("size")
        if raw_size and raw_size / (1024 * 1024) > settings.max_doc_size_mb:
            logger.warning(
                "Dataset %s exceeds configured max size (%s MB)", dataset_id, settings.max_doc_size_mb
            )
    match_filter = _dataset_match_filter(object_id, dataset_id)
    total_rows = await db[DATASET_ROWS_COLLECTION].count_documents(match_filter)
    if total_rows == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset rows not found")

    cursor = (
        db[DATASET_ROWS_COLLECTION]
        .find(match_filter)
        .sort("_id")
        .skip(offset)
        .limit(limit)
    )

    rows: List[Dict[str, Any]] = []
    async for document in cursor:
        rows.append(_normalise_row(document))

    columns, normalised_rows = sample_rows(rows)
    return PreviewResponse(columns=columns, rows=normalised_rows, totalRows=total_rows)


async def infer_dataset_schema(
    db: AsyncIOMotorDatabase, dataset_id: str, sample_size: int = 200
) -> SchemaResponse:
    """Infer the schema for a dataset using a sample of rows."""

    object_id = _parse_dataset_id(dataset_id)
    settings = get_settings()
    metadata = await db[DATASET_COLLECTION].find_one(
        {"_id": object_id}, projection={"sizeInBytes": 1, "size": 1}
    )
    if metadata:
        raw_size = metadata.get("sizeInBytes") or metadata.get("size")
        if raw_size and raw_size / (1024 * 1024) > settings.max_doc_size_mb:
            logger.warning(
                "Inferring schema for a large dataset %s (> %s MB)",
                dataset_id,
                settings.max_doc_size_mb,
            )
    match_filter = _dataset_match_filter(object_id, dataset_id)
    cursor = db[DATASET_ROWS_COLLECTION].find(match_filter).limit(sample_size)

    sample_docs: List[Dict[str, Any]] = []
    async for document in cursor:
        sample_docs.append(_normalise_row(document))

    if not sample_docs:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset rows not found")

    schema_dicts = infer_schema(sample_docs)
    fields = [SchemaField(**item) for item in schema_dicts]
    return SchemaResponse(fields=fields)


async def compute_basic_stats(
    db: AsyncIOMotorDatabase,
    dataset_id: str,
    columns: Optional[Iterable[str]] = None,
    sample_size: int = 10000,
) -> StatsResponse:
    """Compute lightweight statistics for dataset columns."""

    object_id = _parse_dataset_id(dataset_id)
    settings = get_settings()
    metadata = await db[DATASET_COLLECTION].find_one(
        {"_id": object_id}, projection={"sizeInBytes": 1, "size": 1}
    )
    if metadata:
        raw_size = metadata.get("sizeInBytes") or metadata.get("size")
        if raw_size and raw_size / (1024 * 1024) > settings.max_doc_size_mb:
            logger.warning(
                "Computing stats on a large dataset %s (> %s MB)", dataset_id, settings.max_doc_size_mb
            )
    match_filter = _dataset_match_filter(object_id, dataset_id)
    cursor = db[DATASET_ROWS_COLLECTION].find(match_filter).limit(sample_size)

    sample_docs: List[Dict[str, Any]] = []
    async for document in cursor:
        sample_docs.append(_normalise_row(document))

    if not sample_docs:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset rows not found")

    if columns:
        column_set = {column.strip() for column in columns if column.strip()}
    else:
        column_set = set()

    stats_map: Dict[str, Dict[str, Any]] = {}
    for row in sample_docs:
        keys = column_set or row.keys()
        for column in keys:
            column_stats = stats_map.setdefault(
                column,
                {
                    "name": column,
                    "null_count": 0,
                    "non_null_count": 0,
                    "_numeric_values": [],
                },
            )
            value = row.get(column)
            if value is None:
                column_stats["null_count"] += 1
            else:
                column_stats["non_null_count"] += 1
                if is_numeric(value):
                    try:
                        column_stats["_numeric_values"].append(float(value))
                    except (ValueError, TypeError):
                        logger.debug("Skipping non-convertible numeric value for column %s", column)

    column_models: List[ColumnStats] = []
    for column, raw_stats in stats_map.items():
        numeric_values = raw_stats.pop("_numeric_values", [])
        numeric_stats = None
        if numeric_values:
            numeric_stats = NumericStats(
                min=min(numeric_values),
                max=max(numeric_values),
                mean=mean(numeric_values),
            )
        column_models.append(
            ColumnStats(
                name=column,
                null_count=raw_stats["null_count"],
                non_null_count=raw_stats["non_null_count"],
                numeric=numeric_stats,
            )
        )

    column_models.sort(key=lambda column: column.name)
    return StatsResponse(columns=column_models)