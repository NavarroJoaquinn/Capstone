"""Parsing helpers for dataset processing."""
from __future__ import annotations

from collections import defaultdict
from datetime import date, datetime
from decimal import Decimal
from typing import Any, Dict, Iterable, List, Sequence, Tuple

from bson import ObjectId


def coerce_types(value: Any) -> Any:
    """Convert values into JSON-serialisable objects."""

    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, date):
        return value.isoformat()
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, ObjectId):
        return str(value)
    return value


def is_numeric(value: Any) -> bool:
    """Determine if a value should be treated as numeric."""

    if value is None:
        return False
    if isinstance(value, (int, float, Decimal)) and not isinstance(value, bool):
        return True
    if isinstance(value, str):
        try:
            float(value)
            return True
        except ValueError:
            return False
    return False


def _is_boolean(value: Any) -> bool:
    if isinstance(value, bool):
        return True
    if isinstance(value, str):
        return value.lower() in {"true", "false", "yes", "no", "0", "1"}
    return False


def _is_date_like(value: Any) -> bool:
    if isinstance(value, (datetime, date)):
        return True
    if isinstance(value, str):
        try:
            datetime.fromisoformat(value)
            return True
        except ValueError:
            return False
    return False


def sample_rows(
    records: Iterable[Dict[str, Any]], columns: Sequence[str] | None = None
) -> Tuple[List[str], List[List[Any]]]:
    """Normalise a collection of row dictionaries into tabular format."""

    record_list = list(records)
    ordered_columns: List[str] = list(columns) if columns else []
    seen = set(ordered_columns)

    for record in record_list:
        for key in record.keys():
            if key not in seen:
                ordered_columns.append(key)
                seen.add(key)

    normalised_rows: List[List[Any]] = [
        [coerce_types(record.get(col)) for col in ordered_columns] for record in record_list
    ]

    return ordered_columns, normalised_rows


def infer_schema(records: Iterable[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Infer schema metadata for an iterable of records."""

    column_values: Dict[str, List[Any]] = defaultdict(list)
    for record in records:
        for key, value in record.items():
            column_values[key].append(value)

    schema: List[Dict[str, Any]] = []
    for column, values in column_values.items():
        non_null = [value for value in values if value is not None]
        if not non_null:
            inferred_type = "null_mostly"
        elif all(is_numeric(value) for value in non_null):
            inferred_type = "number"
        elif all(_is_boolean(value) for value in non_null):
            inferred_type = "boolean"
        elif all(_is_date_like(value) for value in non_null):
            inferred_type = "date"
        else:
            inferred_type = "string"

        examples = [coerce_types(value) for value in non_null[:5]]
        schema.append({"name": column, "inferredType": inferred_type, "exampleValues": examples})

    schema.sort(key=lambda item: item["name"])
    return schema