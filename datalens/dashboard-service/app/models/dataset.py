"""Pydantic models describing dataset responses."""
from __future__ import annotations

from datetime import datetime
from typing import Any, List, Optional

from pydantic import BaseModel, Field


class DatasetMeta(BaseModel):
    """Basic metadata returned for a dataset."""

    id: str = Field(..., description="Identifier of the dataset")
    name: Optional[str] = Field(None, description="Display name of the dataset")
    description: Optional[str] = Field(None, description="Optional dataset description")
    approx_row_count: Optional[int] = Field(
        None, alias="approxRowCount", description="Approximate number of rows in the dataset"
    )
    size_in_bytes: Optional[int] = Field(
        None, alias="sizeInBytes", description="Approximate dataset size in bytes"
    )
    created_at: Optional[datetime] = Field(None, alias="createdAt")
    updated_at: Optional[datetime] = Field(None, alias="updatedAt")

    class Config:
        allow_population_by_field_name = True
        json_encoders = {datetime: lambda dt: dt.isoformat() if dt else None}


class PreviewResponse(BaseModel):
    """Response payload for dataset preview requests."""

    columns: List[str]
    rows: List[List[Any]]
    total_rows: Optional[int] = Field(None, alias="totalRows")

    class Config:
        allow_population_by_field_name = True


class SchemaField(BaseModel):
    """Inferred schema information for a single column."""

    name: str
    inferred_type: str = Field(..., alias="inferredType")
    example_values: List[Any] = Field(default_factory=list, alias="exampleValues")

    class Config:
        allow_population_by_field_name = True


class SchemaResponse(BaseModel):
    """Response containing schema inference details."""

    fields: List[SchemaField]


class NumericStats(BaseModel):
    """Numeric statistics for a column."""

    minimum: Optional[float] = Field(None, alias="min")
    maximum: Optional[float] = Field(None, alias="max")
    mean: Optional[float] = None

    class Config:
        allow_population_by_field_name = True


class ColumnStats(BaseModel):
    """Summary statistics per column."""

    name: str
    null_count: int = Field(..., alias="nullCount")
    non_null_count: int = Field(..., alias="nonNullCount")
    numeric: Optional[NumericStats] = None

    class Config:
        allow_population_by_field_name = True


class StatsResponse(BaseModel):
    """Response containing summary statistics for multiple columns."""

    columns: List[ColumnStats]