import sys
import os
from datetime import datetime, timedelta, timezone
import random

# Ensure we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine, Base
from app.models import User, WorkoutLog, ExerciseLog, NutritionLog, WeightLog
from app.auth.security import get_password_hash

def seed_db():
    print("Initializing database...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # 1. Create Demo User
    demo_email = "demo@fitpilot.com"
    user = db.query(User).filter(User.email == demo_email).first()
    
    if not user:
        print("Creating demo user...")
        user = User(
            email=demo_email,
            hashed_password=get_password_hash("demo123"),
            name="Demo User",
            age=25,
            weight=75.5,
            height=180.0,
            goal="Hypertrophy"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        print("Demo user already exists. Cleaning up old data...")
        db.query(NutritionLog).filter(NutritionLog.user_id == user.id).delete()
        db.query(ChatHistory).filter(ChatHistory.user_id == user.id).delete()
        db.query(WeightLog).filter(WeightLog.user_id == user.id).delete()
        workout_logs = db.query(WorkoutLog).filter(WorkoutLog.user_id == user.id).all()
        for w in workout_logs:
            db.query(ExerciseLog).filter(ExerciseLog.workout_log_id == w.id).delete()
            db.delete(w)
        db.commit()

    # 2. Generate Workout Logs (past 30 days, ~3 days a week)
    print("Generating workout logs and progress...")
    now = datetime.now(timezone.utc)
    
    exercises = [
        {"name": "Bench Press", "weight_range": (60, 90)},
        {"name": "Squat", "weight_range": (80, 120)},
        {"name": "Deadlift", "weight_range": (100, 150)},
        {"name": "Overhead Press", "weight_range": (40, 60)},
        {"name": "Pull-ups", "weight_range": (0, 10)}
    ]

    for day in range(30, -1, -1):
        if day % 2 == 0:  # Work out every other day
            log_date = now - timedelta(days=day)
            w_log = WorkoutLog(
                user_id=user.id,
                date=log_date,
                notes="Felt great today! Pushed hard on the last set." if day % 4 == 0 else ""
            )
            db.add(w_log)
            db.commit()
            db.refresh(w_log)

            # Add 3-5 random exercises per workout
            num_exercises = random.randint(3, 5)
            workout_exercises = random.sample(exercises, num_exercises)
            
            for ex in workout_exercises:
                # Progressive overload mock: slightly heavier towards recent days
                base_weight = random.uniform(*ex["weight_range"])
                weight_modifier = ((30 - day) / 30.0) * 10  # Up to +10kg over the month
                
                ex_log = ExerciseLog(
                    workout_log_id=w_log.id,
                    exercise_name=ex["name"],
                    sets=random.randint(3, 4),
                    reps=random.randint(8, 12),
                    weight=round(base_weight + weight_modifier, 1),
                    rpe=random.choice([7, 8, 8.5, 9, 9.5])
                )
                db.add(ex_log)
            
            # Seed WeightLog weekly
            if day % 7 == 0:
                demo_weight = 77.0 - ((30 - day) / 30.0) * 2.5 # drops ~2.5kg over the month
                w_hist = WeightLog(user_id=user.id, date=log_date, weight=round(demo_weight, 1))
                db.add(w_hist)

            db.commit()

    # 3. Generate Nutrition Logs (today)
    print("Generating nutrition data for today...")
    foods = [
        ("Oatmeal & Protein Shake", 450, 40, 50, 10),
        ("Chicken Breast & Rice", 600, 55, 65, 15),
        ("Greek Yogurt with Berries", 250, 20, 30, 5),
        ("Steak and Sweet Potato", 700, 50, 60, 30)
    ]
    
    for food in foods:
        n_log = NutritionLog(
            user_id=user.id,
            date=now,
            food_name=food[0],
            calories=food[1],
            protein=food[2],
            carbs=food[3],
            fat=food[4]
        )
        db.add(n_log)
    db.commit()

    print("Demo data successfully seeded!")
    print("Email: demo@fitpilot.com")
    print("Password: demo123")

    db.close()

if __name__ == "__main__":
    seed_db()
