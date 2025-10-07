from fastapi import APIRouter, Depends, HTTPException
from ..deps import get_current_user
from ..gridfs_io import load_dataset_df
from ..analytics_logic import basic_summary, kpi_numeric, correlations
from ..schemas import KPIRequest

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/health")
def health():
    return {"status": "ok"}

@router.get("/{dataset_id}/summary")
def summary(dataset_id: str, user=Depends(get_current_user)):
    df = load_dataset_df(dataset_id, user["email"])
    return basic_summary(df)

@router.post("/{dataset_id}/kpi")
def kpi(dataset_id: str, body: KPIRequest, user=Depends(get_current_user)):
    df = load_dataset_df(dataset_id, user["email"])
    try:
        data = kpi_numeric(df, by=body.by, agg=body.agg, target=body.target, top_n=body.top_n)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"kpi": data}

@router.get("/{dataset_id}/correlations")
def corr(dataset_id: str, user=Depends(get_current_user)):
    df = load_dataset_df(dataset_id, user["email"])
    return correlations(df)