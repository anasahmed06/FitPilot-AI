from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from datetime import datetime, timezone, timedelta
from sqlalchemy import func
from ..models import User, WorkoutLog, ExerciseLog, NutritionLog, WeightLog
from ..auth.security import get_current_user

router = APIRouter()

@router.get("/summary")
def get_dashboard_summary(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    
    # 1. Calories and Protein for today
    today_nutrition = db.query(NutritionLog).filter(
        NutritionLog.user_id == current_user.id,
        NutritionLog.date >= today_start
    ).all()
    
    calories_consumed = sum(n.calories for n in today_nutrition)
    protein_consumed = sum(n.protein for n in today_nutrition)
    
    # 2. Workout Streak
    # Correct date-based logic
    all_workouts = db.query(WorkoutLog).filter(
        WorkoutLog.user_id == current_user.id
    ).order_by(WorkoutLog.date.desc()).all()
    
    unique_dates = []
    for w in all_workouts:
        d = w.date.date()
        if d not in unique_dates:
            unique_dates.append(d)
            
    streak = 0
    check_date = now.date()
    
    for i, d in enumerate(unique_dates):
        delta = (check_date - d).days
        if delta == 0:
            streak += 1
            check_date = d - timedelta(days=1)
        elif delta == 1:
            streak += 1
            check_date = d - timedelta(days=1)
        else:
            break
            
    # 3. Recent PRs moved to dedicated PR Lab
        
    # 4. Current weight from WeightLog
    latest_weight = db.query(WeightLog).filter(
        WeightLog.user_id == current_user.id
    ).order_by(WeightLog.date.desc()).first()
    
    current_weight = latest_weight.weight if latest_weight else (current_user.weight or 0.0)

    # 5. Recent Workouts for Dashboard
    latest_logs = db.query(WorkoutLog).filter(
        WorkoutLog.user_id == current_user.id
    ).order_by(WorkoutLog.date.desc()).limit(3).all()
    
    recent_workouts_list = []
    for log in latest_logs:
        exs = db.query(ExerciseLog).filter(ExerciseLog.workout_log_id == log.id).all()
        # extract just the first two exercises to show as a preview
        preview = [ex.exercise_name for ex in exs[:2]]
        if len(exs) > 2:
            preview.append(f"+{len(exs)-2} more")
            
        recent_workouts_list.append({
            "id": log.id,
            "date": log.date.strftime("%b %d"),
            "preview": ", ".join(preview) if preview else "No exercises"
        })

    # 6. AI Recommendation
    ai_recommendation = None
    if calories_consumed > 0:
        totals = {
            "calories": calories_consumed,
            "protein": protein_consumed,
            "carbs": sum(n.carbs for n in today_nutrition),
            "fat": sum(n.fat for n in today_nutrition),
            "fiber": sum(n.fiber or 0 for n in today_nutrition)
        }
        from ..services.ai_service import AIService
        ai_recommendation = AIService.get_nutrition_suggestions(totals)
    else:
        ai_recommendation = "You haven't logged any meals today. Track your nutrition to get personalized advice!"

    return {
        "current_weight": current_weight,
        "goal_weight": current_user.target_weight or 0.0,
        "calories_target": current_user.target_calories or 2000,
        "calories_consumed": calories_consumed,
        "protein_target": current_user.target_protein or 150,
        "protein_consumed": protein_consumed,
        "water_target": current_user.target_water or 2.5,
        "water_consumed": 0.0, # Placeholder for water logging
        "workout_streak": streak,
        "recent_workouts": recent_workouts_list,
        "current_goal": current_user.goal or "General Fitness",
        "ai_recommendation": ai_recommendation
    }
