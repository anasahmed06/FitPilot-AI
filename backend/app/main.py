from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, dashboard, coach, workouts, nutrition, analytics, prs, weight

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="FitPilot API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the exact frontend origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(coach.router, prefix="/api/coach", tags=["AI Coach"])
app.include_router(workouts.router, prefix="/api/workouts", tags=["Workouts"])
app.include_router(nutrition.router, prefix="/api/nutrition", tags=["Nutrition"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(prs.router, prefix="/api/prs", tags=["PRs"])
app.include_router(weight.router, prefix="/api/weight", tags=["Weight"])

@app.get("/")
def root():
    return {"message": "Welcome to FitPilot API"}
