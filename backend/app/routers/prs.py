from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from ..database import get_db
from ..models import User, PersonalRecord
from ..auth.security import get_current_user

router = APIRouter()

class PRCreate(BaseModel):
    exercise_name: str
    weight: float

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

@router.post("/", response_model=PRResponse)
def add_or_update_pr(pr_data: PRCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check if PR already exists for this exercise
    existing_pr = db.query(PersonalRecord).filter(
        PersonalRecord.user_id == current_user.id,
        PersonalRecord.exercise_name == pr_data.exercise_name
    ).first()

    if existing_pr:
        if pr_data.weight >= existing_pr.current_weight:
            if pr_data.weight > existing_pr.current_weight:
                existing_pr.previous_weight = existing_pr.current_weight
            existing_pr.current_weight = pr_data.weight
            existing_pr.date_achieved = datetime.utcnow()
            db.commit()
            db.refresh(existing_pr)
        return existing_pr
    else:
        new_pr = PersonalRecord(
            user_id=current_user.id,
            exercise_name=pr_data.exercise_name,
            current_weight=pr_data.weight,
            date_achieved=datetime.utcnow()
        )
        db.add(new_pr)
        db.commit()
        db.refresh(new_pr)
        return new_pr
