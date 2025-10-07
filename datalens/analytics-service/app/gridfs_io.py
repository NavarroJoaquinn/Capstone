import io
import pandas as pd
from bson import ObjectId
from fastapi import HTTPException
from .db import get_db, get_fs

def _objid(val):
    try:
        return val if isinstance(val, ObjectId) else ObjectId(str(val))
    except Exception:
        raise HTTPException(status_code=400, detail="file_id inválido (no es ObjectId)")

def _get_dataset_doc(dataset_id: str):
    db = get_db()
    try:
        doc = db["datasets"].find_one({"_id": ObjectId(dataset_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="dataset_id inválido (no es ObjectId)")
    if not doc:
        raise HTTPException(status_code=404, detail="Dataset no encontrado")
    return doc

def ensure_ownership(dataset_id: str, user_email: str):
    doc = _get_dataset_doc(dataset_id)
    if doc.get("user_email") != user_email:
        raise HTTPException(status_code=403, detail="No eres dueño de este dataset")
    return doc

def read_df_from_gridfs(file_id, bucket: str = "fs") -> pd.DataFrame:
    fs = get_fs(bucket=bucket)
    gridout = fs.get(_objid(file_id))
    buf = io.BytesIO(gridout.read())
    # si tus CSV usan separador ';', cambia a: pd.read_csv(buf, sep=';')
    return pd.read_csv(buf)

def load_dataset_df(dataset_id: str, user_email: str) -> pd.DataFrame:
    doc = ensure_ownership(dataset_id, user_email)
    storage = doc.get("storage") or {}
    file_id = storage.get("file_id")
    if not file_id:
        raise HTTPException(status_code=400, detail="Dataset sin storage.file_id")
    bucket = storage.get("bucket", "fs")
    return read_df_from_gridfs(file_id, bucket=bucket)