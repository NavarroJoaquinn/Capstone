from pydantic import BaseModel, Field
from typing import Literal, Optional

class KPIRequest(BaseModel):
    by: Optional[str] = Field(default=None)
    agg: Literal["mean", "sum", "median"] = "mean"
    target: Optional[str] = None
    top_n: int = 5