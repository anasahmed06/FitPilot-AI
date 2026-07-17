from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from ..database import get_db
from ..models import User, PersonalRecord
from ..auth.security import get_current_user

router = APIRouter()

class PRResponse(BaseModel):
    id: int
    exercise_name: str
    current_weight: float
    previous_weight: Optional[float] = None
    date_achieved: datetime

    class Config:
        from_attributes = True

@router.get("/", response_model=List[PRResponse])
def get_prs(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    prs = db.query(PersonalRecord).filter(PersonalRecord.user_id == current_user.id).all()
    return prs
