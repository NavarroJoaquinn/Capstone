from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime

import db as mongo
from utils.auth import get_current_user
from schemas import ProjectCreate, ProjectOut


router = APIRouter(prefix="/projects", tags=["projects"])


# ---------------------------------------------------------
# Helper: convertir string a ObjectId con error claro
# ---------------------------------------------------------
def oid(id_str: str) -> ObjectId:
    try:
        return ObjectId(id_str)
    except:
        raise HTTPException(400, detail=f"'{id_str}' no es un ObjectId válido.")


# ---------------------------------------------------------
# Helper: validar lista de dataset_ids
# ---------------------------------------------------------
def validate_dataset_ids(dataset_ids: list[str]) -> list[ObjectId]:
    if not isinstance(dataset_ids, list):
        raise HTTPException(400, "dataset_ids debe ser una lista")
    return [oid(x) for x in dataset_ids]


# =========================================================
# 1. CREAR PROYECTO
# =========================================================
@router.post("", response_model=ProjectOut)
async def create_project(payload: ProjectCreate, user=Depends(get_current_user)):

    email = user["sub"]

    # Validar IDs
    dataset_oids = validate_dataset_ids(payload.dataset_ids)

    doc = {
        "name": payload.name,
        "description": payload.description,
        "user_email": email,
        "dataset_ids": dataset_oids,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    res = await mongo.projects_col.insert_one(doc)

    doc_out = {
        "id": str(res.inserted_id),
        "name": doc["name"],
        "description": doc["description"],
        "user_email": email,
        "dataset_ids": [str(x) for x in dataset_oids],
        "created_at": doc["created_at"],
        "updated_at": doc["updated_at"],
    }

    return ProjectOut(**doc_out)


# =========================================================
# 2. LISTAR PROYECTOS
# =========================================================
@router.get("", response_model=list[ProjectOut])
async def list_projects(user=Depends(get_current_user)):
    email = user["sub"]

    cursor = mongo.projects_col.find({"user_email": email}).sort("created_at", -1)

    result = []
    async for p in cursor:
        result.append(ProjectOut(
            id=str(p["_id"]),
            name=p["name"],
            description=p.get("description"),
            user_email=p["user_email"],
            dataset_ids=[str(x) for x in p.get("dataset_ids", [])],
            created_at=p["created_at"],
            updated_at=p["updated_at"],
        ))

    return result


# =========================================================
# 3. OBTENER PROYECTO POR ID
# =========================================================
@router.get("/{project_id}", response_model=ProjectOut)
async def get_project(project_id: str, user=Depends(get_current_user)):

    email = user["sub"]

    doc = await mongo.projects_col.find_one({"_id": oid(project_id), "user_email": email})
    if not doc:
        raise HTTPException(404, "Proyecto no encontrado")

    return ProjectOut(
        id=str(doc["_id"]),
        name=doc["name"],
        description=doc.get("description"),
        user_email=doc["user_email"],
        dataset_ids=[str(x) for x in doc.get("dataset_ids", [])],
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
    )


# =========================================================
# 4. ACTUALIZAR PROYECTO
# =========================================================
@router.patch("/{project_id}", response_model=ProjectOut)
async def update_project(project_id: str, payload: ProjectCreate, user=Depends(get_current_user)):

    email = user["sub"]

    dataset_oids = validate_dataset_ids(payload.dataset_ids)

    update_doc = {
        "name": payload.name,
        "description": payload.description,
        "dataset_ids": dataset_oids,
        "updated_at": datetime.utcnow(),
    }

    result = await mongo.projects_col.update_one(
        {"_id": oid(project_id), "user_email": email},
        {"$set": update_doc}
    )

    if result.matched_count == 0:
        raise HTTPException(404, "Proyecto no encontrado")

    doc = await mongo.projects_col.find_one({"_id": oid(project_id)})

    return ProjectOut(
        id=str(doc["_id"]),
        name=doc["name"],
        description=doc.get("description"),
        user_email=doc["user_email"],
        dataset_ids=[str(x) for x in doc.get("dataset_ids", [])],
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
    )


# =========================================================
# 5. ELIMINAR PROYECTO
# =========================================================
@router.delete("/{project_id}")
async def delete_project(project_id: str, user=Depends(get_current_user)):
    email = user["sub"]

    result = await mongo.projects_col.delete_one(
        {"_id": oid(project_id), "user_email": email}
    )

    if result.deleted_count == 0:
        raise HTTPException(404, "Proyecto no encontrado")

    return {"deleted": True, "project_id": project_id}


# =========================================================
# 6. AGREGAR DATASET A PROYECTO
# =========================================================
@router.post("/{project_id}/add_dataset")
async def add_dataset(project_id: str, dataset_id: str, user=Depends(get_current_user)):

    email = user["sub"]

    dataset_oid = oid(dataset_id)

    updated = await mongo.projects_col.update_one(
        {"_id": oid(project_id), "user_email": email},
        {"$addToSet": {"dataset_ids": dataset_oid}}
    )

    if updated.matched_count == 0:
        raise HTTPException(404, "Proyecto no encontrado")

    return {"ok": True, "added": dataset_id}