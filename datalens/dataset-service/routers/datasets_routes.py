from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends
from typing import Optional
from bson import ObjectId
from datetime import datetime
import pandas as pd
import io

import db as mongo
from utils.security import current_user_creds  # 👈 nuevo

router = APIRouter(prefix="/datasets", tags=["datasets"])

def oid(id_str: str) -> ObjectId:
    try:
        return ObjectId(id_str)
    except Exception:
        raise HTTPException(status_code=400, detail="dataset_id inválido")

@router.post("/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    user_payload: dict = Depends(current_user_creds),  # 👈 inyecta usuario desde el Bearer
):
    user_email = user_payload["sub"]

    # 2) Validaciones básicas del archivo
    max_mb = int(mongo.os.getenv("MAX_UPLOAD_MB", "50"))
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Solo se aceptan archivos .csv")

    content = await file.read()
    size_mb = len(content) / (1024 * 1024)
    if size_mb > max_mb:
        raise HTTPException(status_code=400, detail=f"Archivo supera {max_mb}MB")

    # 3) Parsear CSV
    try:
        df_head = pd.read_csv(io.BytesIO(content), nrows=50)
        columns = df_head.columns.tolist()
        row_count = content.count(b"\n")
        if row_count > 0:
            row_count -= 1
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"CSV inválido: {e}")

    # 4) Guardar archivo en GridFS
    try:
        file_id = mongo.fs_bucket.upload_from_stream(
            file.filename,
            io.BytesIO(content),
            metadata={"uploaded_by": user_email, "size_mb": round(size_mb, 2)},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error guardando en GridFS: {e}")

    # 5) Crear documento en datasets
    doc = {
        "user_email": user_email,
        "name": file.filename,
        "status": "ready",
        "row_count": row_count,
        "columns": columns,
        "uploaded_at": datetime.utcnow(),
        "storage": {"type": "gridfs", "file_id": file_id},
        "tags": [],
    }

    res = await mongo.datasets_col.insert_one(doc)
    doc["_id"] = str(res.inserted_id)
    if "storage" in doc and "file_id" in doc["storage"]:
        doc["storage"]["file_id"] = str(doc["storage"]["file_id"])  # 👈 fija la indentación

    return {"ok": True, "dataset": doc}

@router.get("")
async def list_datasets(user_payload: dict = Depends(current_user_creds)):
    cursor = mongo.datasets_col.find({"user_email": user_payload["sub"]}).sort("uploaded_at", -1)
    data = []
    async for d in cursor:
        d["_id"] = str(d["_id"])
        if "storage" in d and "file_id" in d["storage"]:
            d["storage"]["file_id"] = str(d["storage"]["file_id"])
        data.append(d)
    return {"ok": True, "datasets": data}

@router.get("/{dataset_id}")
async def get_dataset(dataset_id: str, user_payload: dict = Depends(current_user_creds)):
    d = await mongo.datasets_col.find_one({"_id": oid(dataset_id), "user_email": user_payload["sub"]})
    if not d:
        raise HTTPException(status_code=404, detail="Dataset no encontrado")

    d["_id"] = str(d["_id"])
    if "storage" in d and "file_id" in d["storage"]:
        d["storage"]["file_id"] = str(d["storage"]["file_id"])
    return {"ok": True, "dataset": d}
