from fastapi import APIRouter, Depends, HTTPException, Request
from utils.auth import get_current_user
import requests
import pandas as pd
import numpy as np
import io
import os
import re

from typing import List, Literal, Optional
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel, Field
from pymongo import ReturnDocument

import db

# ============================================================
# Router
# ============================================================
router = APIRouter(prefix="/analytics", tags=["analytics"])

# ============================================================
# Modelo para guardar análisis
# ============================================================
class AnalysisCreate(BaseModel):
    project_id: Optional[str] = None
    dataset_id: str
    type: Literal["histogram", "piechart", "heatmap"]
    columns: List[str] = Field(default_factory=list)
    name: Optional[str] = None
    description: Optional[str] = None


class AnalysisUpdate(BaseModel):
    """
    Campos que se pueden actualizar de un análisis.
    Ahora mismo sólo usamos 'name' desde el front,
    pero dejamos el resto preparado por si quieres
    ampliar después.
    """
    name: Optional[str] = None
    description: Optional[str] = None
    columns: Optional[List[str]] = None
    type: Optional[Literal["histogram", "piechart", "heatmap"]] = None


DATASET_SERVICE_URL = os.getenv("DATASET_SERVICE_URL", "http://localhost:8001")


# ============================================================
# Helper: descargar DataFrame
# ============================================================
def fetch_dataframe(dataset_id: str, token: str) -> pd.DataFrame:
    url = f"{DATASET_SERVICE_URL}/datasets/{dataset_id}/download"

    resp = requests.get(url, headers={"Authorization": f"Bearer {token}"})

    if resp.status_code != 200:
        raise HTTPException(resp.status_code, "No se pudo obtener el dataset")

    try:
        return pd.read_csv(io.BytesIO(resp.content))
    except Exception:
        raise HTTPException(400, "El archivo descargado no es un CSV válido")


# ============================================================
# COLUMN STATS
# ============================================================
@router.get("/column_stats/{dataset_id}/{column}")
async def column_stats(
    dataset_id: str,
    column: str,
    request: Request,
    user=Depends(get_current_user),
):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")

    df = fetch_dataframe(dataset_id, token)

    if column not in df.columns:
        raise HTTPException(404, f"La columna '{column}' no existe en el dataset.")

    series = df[column]

    # Tipo detectado
    dtype = str(series.dtype)

    # Describe seguro
    try:
        desc = series.describe(include="all").to_dict()
    except Exception:
        desc = {}

    # Valor más frecuente
    try:
        top_value = series.mode().iloc[0]
    except Exception:
        top_value = None

    return {
        "dataset_id": dataset_id,
        "column": column,
        "dtype": dtype,
        "null_count": int(series.isna().sum()),
        "unique_count": series.nunique(dropna=True),
        "top_value": top_value,
        "describe": desc,
        "sample_values": series.dropna().head(10).tolist(),
    }


# ============================================================
# OUTLIERS POR IQR (solo numéricos)
# ============================================================
@router.get("/outliers/{dataset_id}/{column}")
async def outliers_iqr(
    dataset_id: str,
    column: str,
    request: Request,
    user=Depends(get_current_user),
):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    df = fetch_dataframe(dataset_id, token)

    if column not in df.columns:
        raise HTTPException(404, f"La columna '{column}' no existe.")

    # Intentamos convertir a numérico
    col = pd.to_numeric(df[column], errors="coerce")

    if col.dropna().empty:
        raise HTTPException(
            400, f"La columna '{column}' no contiene valores numéricos."
        )

    Q1 = col.quantile(0.25)
    Q3 = col.quantile(0.75)
    IQR = Q3 - Q1
    lower = Q1 - 1.5 * IQR
    upper = Q3 + 1.5 * IQR

    outliers = df[(col < lower) | (col > upper)]

    return {
        "dataset_id": dataset_id,
        "column": column,
        "lower_bound": lower,
        "upper_bound": upper,
        "iqr": IQR,
        "outliers_count": len(outliers),
        "percentage": round((len(outliers) / len(df)) * 100, 2),
        "sample_outliers": outliers.head(20).to_dict(orient="records"),
    }


# ============================================================
# SEMANTIC TYPES (auto clasificación)
# ============================================================
@router.get("/semantic_types/{dataset_id}")
async def semantic_types(
    dataset_id: str,
    request: Request,
    user=Depends(get_current_user),
):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    df = fetch_dataframe(dataset_id, token)

    TYPES: dict[str, str] = {}

    for col in df.columns:
        series = df[col]
        dtype = str(series.dtype)

        # Reglas básicas
        if pd.api.types.is_numeric_dtype(series):
            TYPES[col] = "numeric"
        elif pd.api.types.is_bool_dtype(series):
            TYPES[col] = "boolean"
        elif pd.api.types.is_datetime64_any_dtype(series):
            TYPES[col] = "datetime"
        elif (
            series.dropna()
            .astype(str)
            .str.match(r"^\d{1,3}(\.\d{1,3}){2,3}$")
            .sum()
            > 0
        ):
            TYPES[col] = "ip-address"
        elif series.dropna().astype(str).str.contains("@").sum() > 0:
            TYPES[col] = "email"
        elif (
            series.dropna().astype(str).str.match(r"^[0-9]{7,12}$").sum() > 0
        ):
            TYPES[col] = "id-like"
        elif series.nunique() < len(series) * 0.1:
            TYPES[col] = "categorical"
        else:
            TYPES[col] = "text"

    return {
        "dataset_id": dataset_id,
        "semantic_types": TYPES,
    }


@router.get("/basic/{dataset_id}")
async def basic(dataset_id: str, request: Request, user=Depends(get_current_user)):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    df = fetch_dataframe(dataset_id, token)

    return {
        "dataset_id": dataset_id,
        "columns": df.columns.tolist(),
    }


@router.get("/value_counts/{dataset_id}/{column}")
async def value_counts(
    dataset_id: str,
    column: str,
    request: Request,
    user=Depends(get_current_user),
):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    df = fetch_dataframe(dataset_id, token)

    if column not in df.columns:
        raise HTTPException(404, "Columna no encontrada")

    vc = df[column].value_counts(dropna=False).to_dict()

    return {
        "dataset_id": dataset_id,
        "column": column,
        "value_counts": vc,
    }


@router.get("/histogram/{dataset_id}/{column}")
async def histogram(
    dataset_id: str,
    column: str,
    request: Request,
    user=Depends(get_current_user),
):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    df = fetch_dataframe(dataset_id, token)

    if column not in df.columns:
        raise HTTPException(404, "Columna no encontrada")

    col = pd.to_numeric(df[column], errors="coerce").dropna()
    if col.empty:
        raise HTTPException(400, "La columna no es numérica")

    counts, bins = np.histogram(col, bins=10)

    return {
        "dataset_id": dataset_id,
        "column": column,
        "bins": bins.tolist(),
        "counts": counts.tolist(),
    }


@router.get("/pie/{dataset_id}/{column}")
async def pie(
    dataset_id: str,
    column: str,
    request: Request,
    user=Depends(get_current_user),
):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    df = fetch_dataframe(dataset_id, token)

    if column not in df.columns:
        raise HTTPException(404, "Columna no encontrada")

    vc = df[column].value_counts().head(10)

    return {
        "labels": vc.index.tolist(),
        "values": vc.values.tolist(),
    }


@router.get("/heatmap/{dataset_id}")
async def heatmap(
    dataset_id: str,
    request: Request,
    user=Depends(get_current_user),
):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")

    df = fetch_dataframe(dataset_id, token)
    df_numeric = df.select_dtypes(include=[np.number])

    if df_numeric.empty:
        raise HTTPException(
            400, "No hay columnas numéricas para crear el heatmap"
        )

    corr = df_numeric.corr().round(3)

    return {
        "columns": corr.columns.tolist(),
        "matrix": corr.values.tolist(),
    }


# ============================================================
# GUARDAR ANÁLISIS
# ============================================================
@router.post("/analyses")
async def save_analysis(
    payload: AnalysisCreate,
    user=Depends(get_current_user),
):
    """
    Guarda un análisis asociado a un proyecto.
    """

    if db.analyses_col is None:
        raise HTTPException(500, "Conexión a base de datos no inicializada.")

    # Intentamos obtener algún identificador de usuario sin romper si falta
    user_id = None

    if isinstance(user, dict):
        # Prioridad: _id -> id -> user_id -> email
        if "_id" in user:
            user_id = str(user["_id"])
        elif "id" in user:
            user_id = str(user["id"])
        elif "user_id" in user:
            user_id = str(user["user_id"])
        elif "email" in user:
            user_id = user["email"]

    doc = {
        "project_id": payload.project_id,
        "dataset_id": payload.dataset_id,
        "type": payload.type,
        "columns": payload.columns,
        "name": payload.name,
        "description": payload.description or "",
        "created_at": datetime.utcnow(),
    }

    # Solo guardamos user_id si logramos inferirlo
    if user_id is not None:
        doc["user_id"] = user_id

    result = await db.analyses_col.insert_one(doc)

    return {
        "status": "ok",
        "analysis_id": str(result.inserted_id),
    }


# ============================================================
# LISTAR ANÁLISIS POR PROYECTO
# ============================================================
@router.get("/analyses/by_project/{project_id}")
async def get_analyses_by_project(
    project_id: str,
    user=Depends(get_current_user),
):
    if db.analyses_col is None:
        raise HTTPException(500, "Conexión a base de datos no inicializada.")

    cursor = db.analyses_col.find({"project_id": project_id}).sort(
        "created_at", -1
    )

    analyses: list[dict] = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        analyses.append(doc)

    return analyses


# ============================================================
# OBTENER UN ANÁLISIS POR ID
# ============================================================
@router.get("/analyses/{analysis_id}")
async def get_analysis_by_id(
    analysis_id: str,
    user=Depends(get_current_user),
):
    if db.analyses_col is None:
        raise HTTPException(500, "Conexión a base de datos no inicializada.")

    try:
        oid = ObjectId(analysis_id)
    except Exception:
        raise HTTPException(400, "ID de análisis inválido.")

    doc = await db.analyses_col.find_one({"_id": oid})

    if not doc:
        raise HTTPException(404, "Análisis no encontrado.")

    doc["_id"] = str(doc["_id"])
    return doc
# ============================================================
# ACTUALIZAR UN ANÁLISIS (PATCH)
# ============================================================
@router.patch("/analyses/{analysis_id}")
async def update_analysis(
    analysis_id: str,
    payload: AnalysisUpdate,
    user=Depends(get_current_user),
):
    if db.analyses_col is None:
        raise HTTPException(500, "Conexión a base de datos no inicializada.")

    try:
        oid = ObjectId(analysis_id)
    except Exception:
        raise HTTPException(400, "ID de análisis inválido.")

    # Construimos el diccionario sólo con campos presentes
    update_data = payload.dict(exclude_unset=True)

    # Si no viene nada, no tiene sentido hacer el update
    if not update_data:
        raise HTTPException(400, "No hay campos para actualizar.")

    update_data["updated_at"] = datetime.utcnow()

    updated = await db.analyses_col.find_one_and_update(
        {"_id": oid},
        {"$set": update_data},
        return_document=ReturnDocument.AFTER,
    )

    if not updated:
        raise HTTPException(404, "Análisis no encontrado.")

    updated["_id"] = str(updated["_id"])
    return updated

# ============================================================
# ELIMINAR UN ANÁLISIS
# ============================================================
@router.delete("/analyses/{analysis_id}")
async def delete_analysis(
    analysis_id: str,
    user=Depends(get_current_user),
):
    if db.analyses_col is None:
        raise HTTPException(500, "Conexión a base de datos no inicializada.")

    try:
        oid = ObjectId(analysis_id)
    except Exception:
        raise HTTPException(400, "ID de análisis inválido.")

    result = await db.analyses_col.delete_one({"_id": oid})

    if result.deleted_count == 0:
        raise HTTPException(404, "Análisis no encontrado.")

    return {"status": "deleted"}