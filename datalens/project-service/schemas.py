from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=2)
    description: Optional[str] = None
    dataset_ids: List[str] = []

class ProjectOut(BaseModel):
    id: str
    name: str
    description: Optional[str]
    user_email: str
    dataset_ids: List[str]
    created_at: datetime
    updated_at: datetime