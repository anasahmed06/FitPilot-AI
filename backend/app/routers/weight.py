from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, WeightLog
from ..auth.security import get_current_user
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class WeightLogCreate(BaseModel):
    weight: float
    date: datetime = None

class WeightLogResponse(BaseModel):
    id: int
    weight: float
    date: datetime

    class Config:
        from_attributes = True

@router.post("/", response_model=WeightLogResponse)
def log_weight(log_data: WeightLogCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_log = WeightLog(
        user_id=current_user.id,
        weight=log_data.weight,
        date=log_data.date or datetime.utcnow()
    )
    
    # Update current user weight
    current_user.weight = log_data.weight
    
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log

@router.get("/", response_model=list[WeightLogResponse])
def get_weight_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(WeightLog).filter(WeightLog.user_id == current_user.id).order_by(WeightLog.date.asc()).all()

@router.delete("/{log_id}")
def delete_weight_log(log_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    log = db.query(WeightLog).filter(WeightLog.id == log_id, WeightLog.user_id == current_user.id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
        
    db.delete(log)
    db.commit()
    return {"message": "Deleted successfully"}
