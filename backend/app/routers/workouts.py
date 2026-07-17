from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from datetime import datetime
from ..database import get_db
from ..models import User, WorkoutLog, ExerciseLog, PersonalRecord
from ..auth.security import get_current_user
from ..schemas import WorkoutGenerateRequest, WorkoutLogCreate
from ..services.ai_service import AIService

router = APIRouter()

@router.post("/generate")
def generate_workout(request: WorkoutGenerateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = {
        "goal": current_user.goal,
        "age": current_user.age,
        "weight": current_user.weight,
        "height": current_user.height
    }
    
    prefs = {
        "days_per_week": request.days_per_week,
        "duration_minutes": request.duration_minutes,
        "experience_level": request.experience_level,
        "equipment_available": request.equipment_available
    }
    
    plan = AIService.generate_workout_plan(profile, prefs)
    return {"plan": plan}

@router.post("/log", status_code=status.HTTP_201_CREATED)
def log_workout(request: WorkoutLogCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # 1. Create WorkoutLog
    workout_log = WorkoutLog(
        user_id=current_user.id,
        notes=request.notes
    )
    db.add(workout_log)
    db.commit()
    db.refresh(workout_log)

    # 2. Add Exercises and check for PRs
    new_prs = []
    for ex in request.exercises:
        # Save exercise log
        db.add(ExerciseLog(
            workout_log_id=workout_log.id,
            exercise_name=ex.exercise_name,
            sets=ex.sets,
            reps=ex.reps,
            weight=ex.weight,
            rpe=ex.rpe
        ))
        
        # PR Check Logic (weight-based)
        if ex.weight > 0:
            existing_pr = db.query(PersonalRecord).filter(
                PersonalRecord.user_id == current_user.id,
                PersonalRecord.exercise_name == ex.exercise_name
            ).first()

            if existing_pr:
                if ex.weight > existing_pr.current_weight:
                    existing_pr.previous_weight = existing_pr.current_weight
                    existing_pr.current_weight = ex.weight
                    existing_pr.date_achieved = datetime.utcnow()
                    new_prs.append({"exercise_name": ex.exercise_name, "weight": ex.weight})
            else:
                new_pr = PersonalRecord(
                    user_id=current_user.id,
                    exercise_name=ex.exercise_name,
                    current_weight=ex.weight,
                    date_achieved=datetime.utcnow()
                )
                db.add(new_pr)
                new_prs.append({"exercise_name": ex.exercise_name, "weight": ex.weight})

    db.commit()
    
    return {
        "message": "Workout logged successfully", 
        "workout_log_id": workout_log.id,
        "new_prs": new_prs
    }


@router.get("/history")
def get_workout_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Fetch all logs for user
    logs = db.query(WorkoutLog).filter(WorkoutLog.user_id == current_user.id).order_by(WorkoutLog.date.desc()).all()
    
    history = []
    for log in logs:
        exercises = db.query(ExerciseLog).filter(ExerciseLog.workout_log_id == log.id).all()
        history.append({
            "id": log.id,
            "date": log.date.strftime("%Y-%m-%d"),
            "notes": log.notes,
            "exercises": [
                {
                    "name": ex.exercise_name,
                    "sets": ex.sets,
                    "reps": ex.reps,
                    "weight": ex.weight,
                    "rpe": ex.rpe
                }
                for ex in exercises
            ]
        })
        
    return {"history": history}
