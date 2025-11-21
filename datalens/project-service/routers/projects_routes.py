from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime

import db as mongo
from utils.auth import get_current_user
from schemas import ProjectCreate, ProjectOut

router = APIRouter(prefix="/projects", tags=["projects"])


def oid(id_str: str) -> ObjectId:
    """Convierte un string a ObjectId o lanza error claro."""
    try:
        return ObjectId(id_str)
    except:
        raise HTTPException(status_code=400, detail="ID inválido")


# ============================================================
# 1. CREAR PROYECTO
# ============================================================

@router.post("", response_model=ProjectOut)
async def create_project(
    payload: ProjectCreate,
    user=Depends(get_current_user)
):
    email = user["sub"]

    doc = {
        "name": payload.name,
        "description": payload.description,
        "user_email": email,
        "dataset_ids": payload.dataset_ids,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    res = await mongo.projects_col.insert_one(doc)
    doc["id"] = str(res.inserted_id)

    return ProjectOut(**doc)


# ============================================================
# 2. LISTAR PROYECTOS
# ============================================================

@router.get("", response_model=list[ProjectOut])
async def list_projects(user=Depends(get_current_user)):
    email = user["sub"]

    cursor = mongo.projects_col.find({"user_email": email}).sort("created_at", -1)

    result = []
    async for p in cursor:
        p["id"] = str(p["_id"])
        del p["_id"]
        result.append(ProjectOut(**p))

    return result


# ============================================================
# 3. OBTENER PROYECTO POR ID
# ============================================================

@router.get("/{project_id}", response_model=ProjectOut)
async def get_project(project_id: str, user=Depends(get_current_user)):
    email = user["sub"]

    project = await mongo.projects_col.find_one(
        {"_id": oid(project_id), "user_email": email}
    )
    if not project:
        raise HTTPException(404, "Proyecto no encontrado")

    project["id"] = str(project["_id"])
    del project["_id"]

    return ProjectOut(**project)


# ============================================================
# 4. ACTUALIZAR PROYECTO
# ============================================================

@router.patch("/{project_id}", response_model=ProjectOut)
async def update_project(
    project_id: str,
    payload: ProjectCreate,
    user=Depends(get_current_user)
):
    email = user["sub"]

    update_doc = {
        "name": payload.name,
        "description": payload.description,
        "dataset_ids": payload.dataset_ids,
        "updated_at": datetime.utcnow(),
    }

    result = await mongo.projects_col.update_one(
        {"_id": oid(project_id), "user_email": email},
        {"$set": update_doc}
    )

    if result.matched_count == 0:
        raise HTTPException(404, "Proyecto no encontrado")

    updated = await mongo.projects_col.find_one({"_id": oid(project_id)})
    updated["id"] = str(updated["_id"])
    del updated["_id"]

    return ProjectOut(**updated)


# ============================================================
# 5. ELIMINAR PROYECTO
# ============================================================

@router.delete("/{project_id}")
async def delete_project(project_id: str, user=Depends(get_current_user)):
    email = user["sub"]

    result = await mongo.projects_col.delete_one(
        {"_id": oid(project_id), "user_email": email}
    )

    if result.deleted_count == 0:
        raise HTTPException(404, "Proyecto no encontrado")

    return {"ok": True, "deleted": project_id}


# ============================================================
# 6. AGREGAR DATASET A PROYECTO
# ============================================================

@router.post("/{project_id}/add_dataset")
async def add_dataset(
    project_id: str,
    dataset_id: str,
    user=Depends(get_current_user)
):
    email = user["sub"]

    updated = await mongo.projects_col.update_one(
        {"_id": oid(project_id), "user_email": email},
        {"$addToSet": {"dataset_ids": dataset_id}}
    )

    if updated.matched_count == 0:
        raise HTTPException(404, "Proyecto no encontrado")

    return {"ok": True}