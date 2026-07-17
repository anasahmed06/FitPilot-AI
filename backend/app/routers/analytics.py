from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import User, WorkoutLog, ExerciseLog, NutritionLog, WeightLog
from ..auth.security import get_current_user

router = APIRouter()

@router.get("/progress")
def get_progress_data(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    weight_logs = db.query(WeightLog).filter(WeightLog.user_id == current_user.id).order_by(WeightLog.date).all()
    weight_data = [
        {"date": log.date.strftime("%Y-%m-%d"), "weight": log.weight}
        for log in weight_logs
    ]
    if not weight_data and current_user.weight:
        weight_data = [{"date": "Initial", "weight": current_user.weight}]
    # Volume per workout (Total sets * reps * weight)
    workout_logs = db.query(WorkoutLog).filter(WorkoutLog.user_id == current_user.id).order_by(WorkoutLog.date).all()
    volume_data = []
    
    for w_log in workout_logs:
        exercises = db.query(ExerciseLog).filter(ExerciseLog.workout_log_id == w_log.id).all()
        total_volume = sum(ex.sets * ex.reps * ex.weight for ex in exercises)
        volume_data.append({
            "date": w_log.date.strftime("%Y-%m-%d"),
            "volume": total_volume
        })
        
    return {
        "weight_data": weight_data,
        "volume_data": volume_data if volume_data else [{"date": "Today", "volume": 0}]
    }
