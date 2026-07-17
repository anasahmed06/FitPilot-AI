import time
import json
from openai import OpenAI
from ..config import settings

# Initialize OpenRouter Client
if settings.OPENROUTER_API_KEY:
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=settings.OPENROUTER_API_KEY,
        default_headers={
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "FitPilot"
        }
    )
else:
    client = None

class AIService:
    @staticmethod
    def _call_with_retry(messages, retries=3):
        if not client:
            raise ValueError("OpenRouter API Key is missing. Please add OPENROUTER_API_KEY to your backend/.env file.")
            
        models_to_try = [
            settings.OPENROUTER_MODEL,
            "google/gemma-4-26b-a4b-it:free",
            "google/gemma-4-31b-it:free",
            "poolside/laguna-xs-2.1:free"
        ]
        
        last_exception = None
        
        for model in models_to_try:
            for attempt in range(retries):
                try:
                    print(f"Attempting API request with model: {model}")
                    response = client.chat.completions.create(
                        model=model,
                        messages=messages,
                    )
                    print(f"Success with model {model}!")
                    return response.choices[0].message.content
                except Exception as e:
                    last_exception = e
                    import traceback
                    print(f"OpenRouter API Error on attempt {attempt+1} with model {model}: {e}")
                    traceback.print_exc()
                    time.sleep(1) # Backoff
                    
        raise last_exception

    @staticmethod
    def get_fitness_coach_response(user_profile: dict, message_history: list, new_message: str) -> str:
        system_prompt = f"""
        You are an expert AI fitness coach, nutritionist, and personal trainer.
        Your goal is to provide concise, accurate, and motivating advice.
        User Profile:
        - Goal: {user_profile.get('goal', 'General Fitness')}
        - Age: {user_profile.get('age', 'Not specified')}
        - Weight: {user_profile.get('weight', 'Not specified')} kg
        - Height: {user_profile.get('height', 'Not specified')} cm
        
        Respond in markdown. Be engaging and professional.
        """
        
        messages = [{"role": "system", "content": system_prompt}]
        for msg in message_history:
            role = "user" if msg["role"] == "user" else "assistant"
            content = msg.get("parts", [msg.get("content", "")])[0]
            if type(content) is dict:
                content = content.get("text", "")
            messages.append({"role": role, "content": content})
            
        messages.append({"role": "user", "content": new_message})
        
        return AIService._call_with_retry(messages)
            
    @staticmethod
    def generate_workout_plan(user_profile: dict, prefs: dict) -> str:
        system_prompt = f"""
        You are an expert fitness coach. Generate a {prefs['days_per_week']}-day workout plan for a user.
        User Profile: {user_profile.get('goal')}, {user_profile.get('weight')} kg, {user_profile.get('height')} cm.
        Preferences: {prefs['duration_minutes']} min/day, Level: {prefs['experience_level']}, Equipment: {prefs['equipment_available']}.
        
        Provide the response in Markdown format. For each day, include:
        - Day Name (e.g., Push Day)
        - Warmup
        - List of exercises with Sets, Reps, and Rest times.
        - Cooldown
        """
        messages = [{"role": "user", "content": system_prompt}]
        return AIService._call_with_retry(messages)

    @staticmethod
    def analyze_nutrition(food_description: str) -> str:
        system_prompt = f"""
        You are an expert nutritionist. Estimate the nutritional content of the following meal description.
        Return ONLY a JSON object (no markdown formatting, no code blocks).
        The JSON object must have exactly these keys:
        - "food_name" (a clean summary of the meal, string)
        - "calories" (integer)
        - "protein" (float, grams)
        - "carbs" (float, grams)
        - "fat" (float, grams)
        - "fiber" (float, grams)
        
        Meal description: {food_description}
        """
        messages = [{"role": "user", "content": system_prompt}]
        response = AIService._call_with_retry(messages)
        return response.replace('```json', '').replace('```', '').strip()

    @staticmethod
    def get_nutrition_suggestions(totals: dict) -> str:
        system_prompt = f"""
        You are an AI nutrition coach. Here are a user's macronutrient totals for today:
        Calories: {totals.get('calories', 0)} kcal
        Protein: {totals.get('protein', 0)} g
        Carbs: {totals.get('carbs', 0)} g
        Fat: {totals.get('fat', 0)} g
        Fiber: {totals.get('fiber', 0)} g
        
        Provide 1 to 2 short, actionable sentences of advice based on these numbers.
        Example: "You are low on protein, try adding a shake. Great job on your fiber intake!"
        """
        messages = [{"role": "user", "content": system_prompt}]
        return AIService._call_with_retry(messages)
