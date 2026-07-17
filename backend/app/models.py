from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String)
    
    # Onboarding Status
    is_onboarded = Column(Boolean, default=False)
    
    # Demographics
    gender = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    weight = Column(Float, nullable=True) # current weight in kg
    height = Column(Float, nullable=True) # in cm
    
    # Preferences & Experience
    activity_level = Column(String, nullable=True) # Sedentary, Light, Moderate, Active, Very Active
    workout_experience = Column(String, nullable=True) # Beginner, Intermediate, Advanced
    preferred_workout_days = Column(Integer, nullable=True) # 1-7
    workout_duration = Column(Integer, nullable=True) # in minutes
    dietary_preference = Column(String, nullable=True) # None, Vegan, Keto, etc.

    # Goals
    goal = Column(String, nullable=True) # Lose Fat, Gain Muscle, etc.
    target_weight = Column(Float, nullable=True)
    target_calories = Column(Integer, nullable=True)
    target_protein = Column(Integer, nullable=True)
    target_water = Column(Float, nullable=True) # in Liters
    target_sleep = Column(Float, nullable=True) # in Hours
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class WorkoutLog(Base):
    __tablename__ = "workout_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(DateTime(timezone=True), server_default=func.now())
    notes = Column(String, nullable=True)

class ExerciseLog(Base):
    __tablename__ = "exercise_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    workout_log_id = Column(Integer, ForeignKey("workout_logs.id"))
    exercise_name = Column(String)
    sets = Column(Integer)
    reps = Column(Integer)
    weight = Column(Float)
    rpe = Column(Float, nullable=True)

class NutritionLog(Base):
    __tablename__ = "nutrition_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(DateTime(timezone=True), server_default=func.now())
    food_name = Column(String)
    calories = Column(Integer)
    protein = Column(Float)
    carbs = Column(Float)
    fat = Column(Float)
    fiber = Column(Float, nullable=True)

class ChatHistory(Base):
    __tablename__ = "chat_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    role = Column(String, nullable=False) # "user" or "assistant"
    content = Column(String, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class WeightLog(Base):
    __tablename__ = "weight_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    weight = Column(Float, nullable=False)
    date = Column(DateTime(timezone=True), server_default=func.now())

class PersonalRecord(Base):
    __tablename__ = "personal_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    exercise_name = Column(String, index=True)
    current_weight = Column(Float)
    previous_weight = Column(Float, nullable=True)
    date_achieved = Column(DateTime(timezone=True), server_default=func.now())
