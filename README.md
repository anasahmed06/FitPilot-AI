# FitPilot

FitPilot is an AI-powered fitness platform featuring a personal trainer, nutritionist, workout tracker, and fitness coach. Built with FastAPI and React.

## Features (MVP)
- **Authentication**: JWT-based user login and registration.
- **Dashboard**: Track your weight goal, calories, protein, and workout streak.
- **AI Coach**: A chatbot powered by Google Gemini API to answer fitness questions.
- **Workout Generator**: Generate custom workout plans using AI based on your goals, equipment, and level.
- **Workout Logger**: Log exercises, sets, reps, and weights.
- **Nutrition Planner**: Simple diary to log food intake and track daily macros (Protein, Carbs, Fats) and calories.
- **Progress Analytics**: Visual charts for body weight and workout volume using Recharts.

## Architecture
- **Backend**: Python 3.10+, FastAPI, SQLAlchemy, SQLite (Development) / PostgreSQL (Production ready).
- **Frontend**: React 18, Vite, Tailwind CSS, Recharts.
- **AI**: Google Gemini API integration.

## Installation and Local Setup (Docker)

1. **Clone the repository.**
2. **Setup environment variables**:
   ```bash
   cp .env.example .env
 
   ```
3. **Run with Docker Compose**:
   ```bash
   docker-compose up --build
   ```
4. **Access the application**:
   - Frontend: `http://localhost:5173`
   - Backend API Docs (Swagger): `http://localhost:8000/docs`

## API Documentation
The API is self-documented via FastAPI's automatic Swagger integration.
Once the backend is running, navigate to `/docs` on the backend server to see all endpoints, request bodies, and response schemas.
