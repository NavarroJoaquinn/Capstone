# schemas.py
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, BeforeValidator
from typing import Annotated
from bson import ObjectId


# ------------------------------
#   ObjectId compatible con Pydantic v2
# ------------------------------
def validate_object_id(value):
    """Acepta ObjectId o string y siempre devuelve string compatible."""
    if isinstance(value, ObjectId):
        return str(value)
    try:
        return str(ObjectId(value))
    except Exception:
        raise ValueError("Invalid ObjectId")


PyObjectId = Annotated[str, BeforeValidator(validate_object_id)]


# ------------------------------
#   MODELOS
# ------------------------------

class DatasetBase(BaseModel):
    name: str                                   # nombre legible del dataset
    description: Optional[str] = None           # descripción opcional
    tags: List[str] = []                        # etiquetas libres: ["ventas", "enero"]


class DatasetCreate(DatasetBase):
    # no lleva nada extra; el archivo va en el form-data
    pass


class DatasetOut(DatasetBase):
    id: PyObjectId = Field(alias="_id")
    user_email: str
    status: str = "ready"                       # ready, processing, failed...
    row_count: Optional[int] = None
    columns: List[str] = []
    size_bytes: Optional[int] = None
    uploaded_at: datetime
    storage: dict                        # { type: "gridfs", file_id: ObjectId }

    model_config = {
        "populate_by_name": True,
        "json_encoders": {
            ObjectId: str
        }
    }