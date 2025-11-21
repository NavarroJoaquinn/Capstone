from pydantic import BaseModel
from typing import Dict, Any, List

class BasicAnalysis(BaseModel):
    row_count: int
    column_count: int
    columns: List[str]
    dtypes: Dict[str, str]
    missing_values: Dict[str, int]
    describe: Dict[str, Any]