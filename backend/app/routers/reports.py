from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.report import Report
from app.schemas.report import ReportCreate
from app.utils.dependencies import get_optional_user
from app.models.user import User

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.post("/", status_code=status.HTTP_201_CREATED)
def submit_report(data: ReportCreate, db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_optional_user)):
    report = Report(
        reported_by_user_id=current_user.id if current_user else None,
        reference_id=data.reference_id,
        reference_type=data.reference_type,
        reason=data.reason
    )
    db.add(report)
    db.commit()
    return {"message": "Report submitted successfully"}