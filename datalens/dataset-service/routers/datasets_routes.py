from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import StreamingResponse
from datetime import datetime
from bson import ObjectId
from typing import List, Optional
import pandas as pd
import numpy as np
import io
import db

from schemas import DatasetOut
from utils.auth import get_current_user


router = APIRouter(prefix="/datasets", tags=["datasets"])


# ============================================================
# 1. UPLOAD DATASET
# ============================================================

@router.post("/upload", response_model=DatasetOut)
async def upload_dataset(
    file: UploadFile = File(...),
    description: Optional[str] = None,
    tags: Optional[str] = None,
    user=Depends(get_current_user),
):
    user_email = user["sub"]

    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Solo se permiten archivos CSV")

    content = await file.read()

    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception:
        raise HTTPException(400, "El archivo no es un CSV válido")

    # Guardar archivo en GridFS
    file_id = db.fs_bucket.upload_from_stream(file.filename, io.BytesIO(content))

    dataset_doc = {
        "user_email": user_email,
        "name": file.filename,
        "description": description,
        "tags": tags.split(",") if tags else [],
        "status": "ready",
        "row_count": len(df),
        "columns": list(df.columns),
        "size_bytes": len(content),
        "uploaded_at": datetime.utcnow(),
        "storage": {
            "type": "gridfs",
            "file_id": str(file_id),
        },
    }

    result = await db.datasets_col.insert_one(dataset_doc)
    dataset_doc["_id"] = str(result.inserted_id)

    return DatasetOut(**dataset_doc)


# ============================================================
# 2. LISTAR DATASETS DEL USUARIO
# ============================================================

@router.get("/", response_model=List[DatasetOut])
async def list_datasets(user=Depends(get_current_user)):
    user_email = user["sub"]

    docs = await db.datasets_col.find({"user_email": user_email}).to_list(None)

    for d in docs:
        d["_id"] = str(d["_id"])
        d["storage"]["file_id"] = str(d["storage"]["file_id"])

    return [DatasetOut(**d) for d in docs]


# ============================================================
# 3. OBTENER DATASET POR ID
# ============================================================

@router.get("/{dataset_id}", response_model=DatasetOut)
async def get_dataset(dataset_id: str, user=Depends(get_current_user)):
    user_email = user["sub"]

    doc = await db.datasets_col.find_one({"_id": ObjectId(dataset_id)})
    if not doc:
        raise HTTPException(404, "Dataset no encontrado")

    if doc["user_email"] != user_email:
        raise HTTPException(403, "No tienes permiso para ver este dataset")

    doc["_id"] = str(doc["_id"])
    doc["storage"]["file_id"] = str(doc["storage"]["file_id"])

    return DatasetOut(**doc)


# ============================================================
# 4. ELIMINAR DATASET
# ============================================================

@router.delete("/{dataset_id}")
async def delete_dataset(dataset_id: str, user=Depends(get_current_user)):
    user_email = user["sub"]

    doc = await db.datasets_col.find_one({"_id": ObjectId(dataset_id)})
    if not doc:
        raise HTTPException(404, "Dataset no encontrado")

    if doc["user_email"] != user_email:
        raise HTTPException(403, "No puedes eliminar este dataset")

    file_id = ObjectId(doc["storage"]["file_id"])
    db.fs_bucket.delete(file_id)

    await db.datasets_col.delete_one({"_id": ObjectId(dataset_id)})

    return {"deleted": True, "dataset_id": dataset_id}


# ============================================================
# 5. DESCARGAR DATASET COMPLETO
# ============================================================

@router.get("/{dataset_id}/download")
async def download_dataset(dataset_id: str, user=Depends(get_current_user)):
    user_email = user["sub"]

    doc = await db.datasets_col.find_one({"_id": ObjectId(dataset_id)})
    if not doc:
        raise HTTPException(404, "Dataset no encontrado")

    if doc["user_email"] != user_email:
        raise HTTPException(403, "No tienes permiso para este dataset")

    file_id = ObjectId(doc["storage"]["file_id"])
    stream = db.fs_bucket.open_download_stream(file_id)

    return StreamingResponse(
        stream,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={doc['name']}"},
    )


# ============================================================
# 6. PREVIEW DE 50 FILAS
# ============================================================

@router.get("/{dataset_id}/preview")
async def preview_dataset(dataset_id: str, user=Depends(get_current_user)):
    user_email = user["sub"]

    doc = await db.datasets_col.find_one({"_id": ObjectId(dataset_id)})
    if not doc:
        raise HTTPException(404, "Dataset no encontrado")

    if doc["user_email"] != user_email:
        raise HTTPException(403, "No tienes permiso")

    file_id = ObjectId(doc["storage"]["file_id"])
    stream = db.fs_bucket.open_download_stream(file_id)

    file_bytes = stream.read()

    df = pd.read_csv(io.BytesIO(file_bytes))

    df = df.replace([np.nan, np.inf, -np.inf], None)

    return {
        "columns": list(df.columns),
        "preview": df.head(50).to_dict(orient="records"),
        "row_count": doc.get("row_count"),
    }


# ============================================================
# 7. UPDATE METADATA
# ============================================================

@router.patch("/{dataset_id}", response_model=DatasetOut)
async def update_dataset(
    dataset_id: str,
    name: Optional[str] = None,
    description: Optional[str] = None,
    tags: Optional[str] = None,
    user=Depends(get_current_user),
):
    user_email = user["sub"]

    update = {}
    if name: update["name"] = name
    if description: update["description"] = description
    if tags: update["tags"] = tags.split(",")

    if not update:
        raise HTTPException(400, "No se enviaron campos para actualizar")

    doc = await db.datasets_col.find_one({"_id": ObjectId(dataset_id)})
    if not doc:
        raise HTTPException(404, "Dataset no encontrado")

    if doc["user_email"] != user_email:
        raise HTTPException(403, "No tienes permiso")

    await db.datasets_col.update_one({"_id": doc["_id"]}, {"$set": update})

    doc.update(update)
    doc["_id"] = str(doc["_id"])
    doc["storage"]["file_id"] = str(doc["storage"]["file_id"])

    return DatasetOut(**doc)


# ============================================================
# 8. SEARCH DATASETS
# ============================================================

@router.get("/search/q", response_model=List[DatasetOut])
async def search_datasets(q: str, user=Depends(get_current_user)):
    user_email = user["sub"]

    docs = await db.datasets_col.find({
        "user_email": user_email,
        "$or": [
            {"name": {"$regex": q, "$options": "i"}},
            {"tags": {"$regex": q, "$options": "i"}},
        ]
    }).to_list(None)

    for d in docs:
        d["_id"] = str(d["_id"])
        d["storage"]["file_id"] = str(d["storage"]["file_id"])

    return [DatasetOut(**d) for d in docs]