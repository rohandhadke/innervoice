from pydantic import BaseModel
from app.models.report import ReasonEnum

class ReportCreate(BaseModel):
    reference_id: int
    reference_type: str
    reason: ReasonEnum