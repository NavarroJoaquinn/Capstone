from fastapi import APIRouter, Depends, HTTPException, Request
from utils.auth import get_current_user
import requests
import pandas as pd
import io
import os

router = APIRouter(prefix="/analytics", tags=["analytics"])

DATASET_SERVICE_URL = os.getenv("DATASET_SERVICE_URL", "http://localhost:8001")


def fetch_dataframe(dataset_id: str, token: str) -> pd.DataFrame:
    url = f"{DATASET_SERVICE_URL}/datasets/{dataset_id}/download"

    resp = requests.get(url, headers={"Authorization": f"Bearer {token}"})

    if resp.status_code != 200:
        raise HTTPException(resp.status_code, "No se pudo obtener el dataset")

    return pd.read_csv(io.BytesIO(resp.content))


@router.get("/basic/{dataset_id}")
async def basic_analysis(
    dataset_id: str,
    request: Request,
    user=Depends(get_current_user)
):

    # EXTRAER TOKEN REAL DEL HEADER
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(401, "Token no enviado")

    token = auth_header.replace("Bearer ", "")

    # 1. Obtener DataFrame desde dataset-service
    df = fetch_dataframe(dataset_id, token)

    # 2. Análisis básico
    return {
        "row_count": df.shape[0],
        "column_count": df.shape[1],
        "columns": list(df.columns),
        "dtypes": df.dtypes.astype(str).to_dict(),
        "missing_values": df.isna().sum().to_dict(),
        "describe": df.describe(include="all").fillna("N/A").to_dict(),
    }