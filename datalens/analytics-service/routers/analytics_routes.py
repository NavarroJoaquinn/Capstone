from fastapi import APIRouter, Depends, HTTPException, Request
from utils.auth import get_current_user
import requests
import pandas as pd
import numpy as np
import io
import os
import re

router = APIRouter(prefix="/analytics", tags=["analytics"])

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
    user=Depends(get_current_user)
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
    except:
        desc = {}

    # Valor más frecuente
    try:
        top_value = series.mode().iloc[0]
    except:
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
    user=Depends(get_current_user)
):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    df = fetch_dataframe(dataset_id, token)

    if column not in df.columns:
        raise HTTPException(404, f"La columna '{column}' no existe.")

    # Intentamos convertir a numérico
    col = pd.to_numeric(df[column], errors="coerce")

    if col.dropna().empty:
        raise HTTPException(400, f"La columna '{column}' no contiene valores numéricos.")

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
    user=Depends(get_current_user)
):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    df = fetch_dataframe(dataset_id, token)

    TYPES = {}

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
        elif series.dropna().astype(str).str.match(r"^\d{1,3}(\.\d{1,3}){2,3}$").sum() > 0:
            TYPES[col] = "ip-address"
        elif series.dropna().astype(str).str.contains("@").sum() > 0:
            TYPES[col] = "email"
        elif series.dropna().astype(str).str.match(r"^[0-9]{7,12}$").sum() > 0:
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
        "columns": df.columns.tolist()
    }

@router.get("/value_counts/{dataset_id}/{column}")
async def value_counts(dataset_id: str, column: str, request: Request, user=Depends(get_current_user)):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    df = fetch_dataframe(dataset_id, token)

    if column not in df.columns:
        raise HTTPException(404, "Columna no encontrada")

    vc = df[column].value_counts(dropna=False).to_dict()

    return {
        "dataset_id": dataset_id,
        "column": column,
        "value_counts": vc
    }

@router.get("/histogram/{dataset_id}/{column}")
async def histogram(dataset_id: str, column: str, request: Request, user=Depends(get_current_user)):
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
async def pie(dataset_id: str, column: str, request: Request, user=Depends(get_current_user)):
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
async def heatmap(dataset_id: str, request: Request, user=Depends(get_current_user)):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")

    df = fetch_dataframe(dataset_id, token)
    df_numeric = df.select_dtypes(include=[np.number])

    if df_numeric.empty:
        raise HTTPException(400, "No hay columnas numéricas para crear el heatmap")

    corr = df_numeric.corr().round(3)

    return {
        "columns": corr.columns.tolist(),
        "matrix": corr.values.tolist()
    }