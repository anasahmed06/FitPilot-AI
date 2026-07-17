import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from collections import defaultdict

from ..database import get_db
from ..models import User, NutritionLog
from ..auth.security import get_current_user
from ..schemas import NutritionLogCreate, NutritionAnalyzeRequest
from ..services.ai_service import AIService

router = APIRouter()

@router.post("/analyze")
def analyze_nutrition(request: NutritionAnalyzeRequest, current_user: User = Depends(get_current_user)):
    try:
        response_str = AIService.analyze_nutrition(request.food_description)
        # Parse the JSON string
        result = json.loads(response_str)
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        return result
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse AI response.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/log")
def log_nutrition(request: NutritionLogCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_log = NutritionLog(
        user_id=current_user.id,
        food_name=request.food_name,
        calories=request.calories,
        protein=request.protein,
        carbs=request.carbs,
        fat=request.fat,
        fiber=request.fiber or 0.0
    )
    db.add(new_log)
    db.commit()
    return {"message": "Food logged successfully"}

@router.get("/today")
def get_today_nutrition(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Assuming today means the current day in UTC for simplicity
    today = datetime.utcnow().date()
    logs = db.query(NutritionLog).filter(
        NutritionLog.user_id == current_user.id,
        func.date(NutritionLog.date) == today
    ).all()
    
    total_calories = sum(log.calories for log in logs)
    total_protein = sum(log.protein for log in logs)
    total_carbs = sum(log.carbs for log in logs)
    total_fat = sum(log.fat for log in logs)
    total_fiber = sum(log.fiber or 0 for log in logs)
    
    totals = {
        "calories": total_calories,
        "protein": round(total_protein, 1),
        "carbs": round(total_carbs, 1),
        "fat": round(total_fat, 1),
        "fiber": round(total_fiber, 1)
    }
    
    # Get suggestions only if there are logs
    suggestions = ""
    if logs:
        suggestions = AIService.get_nutrition_suggestions(totals)
    
    return {
        "logs": logs,
        "summary": totals,
        "suggestions": suggestions
    }

@router.get("/history")
def get_nutrition_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logs = db.query(NutritionLog).filter(NutritionLog.user_id == current_user.id).order_by(NutritionLog.date.desc()).all()
    
    history_by_date = defaultdict(list)
    for log in logs:
        date_str = log.date.strftime("%Y-%m-%d")
        history_by_date[date_str].append({
            "id": log.id,
            "food_name": log.food_name,
            "calories": log.calories,
            "protein": log.protein,
            "carbs": log.carbs,
            "fat": log.fat,
            "fiber": log.fiber,
            "time": log.date.strftime("%H:%M")
        })
        
    return [{"date": k, "meals": v} for k, v in history_by_date.items()]

@router.put("/log/{log_id}")
def update_nutrition_log(log_id: int, request: NutritionLogCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    log = db.query(NutritionLog).filter(NutritionLog.id == log_id, NutritionLog.user_id == current_user.id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
        
    log.food_name = request.food_name
    log.calories = request.calories
    log.protein = request.protein
    log.carbs = request.carbs
    log.fat = request.fat
    log.fiber = request.fiber or 0.0
    
    db.commit()
    return {"message": "Log updated successfully"}

@router.delete("/log/{log_id}")
def delete_nutrition_log(log_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    log = db.query(NutritionLog).filter(NutritionLog.id == log_id, NutritionLog.user_id == current_user.id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
        
    db.delete(log)
    db.commit()
    return {"message": "Log deleted successfully"}
