from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    is_onboarded: Optional[bool] = None
    gender: Optional[str] = None
    age: Optional[int] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    activity_level: Optional[str] = None
    workout_experience: Optional[str] = None
    preferred_workout_days: Optional[int] = None
    workout_duration: Optional[int] = None
    dietary_preference: Optional[str] = None
    goal: Optional[str] = None
    target_weight: Optional[float] = None
    target_calories: Optional[int] = None
    target_protein: Optional[int] = None
    target_water: Optional[float] = None
    target_sleep: Optional[float] = None

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    name: Optional[str] = None
    is_onboarded: bool
    gender: Optional[str] = None
    age: Optional[int] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    activity_level: Optional[str] = None
    workout_experience: Optional[str] = None
    preferred_workout_days: Optional[int] = None
    workout_duration: Optional[int] = None
    dietary_preference: Optional[str] = None
    goal: Optional[str] = None
    target_weight: Optional[float] = None
    target_calories: Optional[int] = None
    target_protein: Optional[int] = None
    target_water: Optional[float] = None
    target_sleep: Optional[float] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class ChatRequest(BaseModel):
    message: str

class WorkoutGenerateRequest(BaseModel):
    days_per_week: int
    duration_minutes: int
    experience_level: str
    equipment_available: str

class ExerciseLogCreate(BaseModel):
    exercise_name: str
    sets: int
    reps: int
    weight: float
    rpe: Optional[float] = None

class WorkoutLogCreate(BaseModel):
    notes: Optional[str] = None
    exercises: list[ExerciseLogCreate]

class NutritionLogCreate(BaseModel):
    food_name: str
    calories: int
    protein: float
    carbs: float
    fat: float
    fiber: Optional[float] = None

class NutritionAnalyzeRequest(BaseModel):
    food_description: str

