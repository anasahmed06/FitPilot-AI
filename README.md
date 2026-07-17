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

## Production Deployment (AWS App Runner)

This repository is pre-configured for a single-container deployment on AWS App Runner, following the IBM SkillsBuild architecture. The React frontend is built automatically and served by Nginx, which also acts as a reverse proxy routing `/api` traffic to the internal FastAPI server.

### Steps to Deploy:

1. **Build the Docker Image**
   Build the multi-stage image which compiles the frontend and prepares the backend:
   ```bash
   docker build -t fitpilot-aws .
   ```

2. **Push to Amazon ECR (Elastic Container Registry)**
   ```bash
   # Authenticate Docker to your ECR registry
   aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.<region>.amazonaws.com

   # Tag and Push
   docker tag fitpilot-aws:latest <aws_account_id>.dkr.ecr.<region>.amazonaws.com/fitpilot-aws:latest
   docker push <aws_account_id>.dkr.ecr.<region>.amazonaws.com/fitpilot-aws:latest
   ```

3. **Deploy via AWS App Runner**
   - Go to the **AWS App Runner** console and create a new service.
   - Choose **Amazon ECR** as the repository type and select your pushed image.
   - Under **Deployment settings**, choose Manual or Automatic (if you want CD).
   - Set the **Port** to `8080` (Configured in `nginx.conf`).
   - Add the following **Environment Variables**:
     - `OPENROUTER_API_KEY`: Your OpenRouter / AI key.
     - `DATABASE_URL`: Your production database URL (if using PostgreSQL/RDS). Leave blank to use SQLite for demo purposes.
   - Click **Create & Deploy**.

4. **Access the App**
   Once the status reads *Running*, click the **Default domain** URL provided by AWS App Runner. Your frontend and backend will be seamlessly accessible under one URL!
