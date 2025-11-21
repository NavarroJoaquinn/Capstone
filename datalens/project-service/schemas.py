from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ProjectBase(BaseModel):
    name: str = Field(..., min_length=2)
    description: Optional[str] = None
    dataset_ids: List[str] = []

class ProjectCreate(ProjectBase):
    """Payload de creación / actualización."""
    pass

class ProjectOut(ProjectBase):
    id: str
    user_email: str
    created_at: datetime
    updated_at: datetime