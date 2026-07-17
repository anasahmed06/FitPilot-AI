import requests
import json
import uuid

BASE_URL = "http://localhost:8000"

def run_tests():
    print("--- Starting Integration Tests ---")
    
    # 1. Signup a new user
    unique_email = f"test_{uuid.uuid4().hex[:6]}@example.com"
    password = "testpassword123"
    
    print(f"\n1. Signing up user: {unique_email}")
    res = requests.post(f"{BASE_URL}/api/auth/signup", json={
        "email": unique_email,
        "password": password,
        "name": "Integration Test User"
    })
    assert res.status_code == 201, f"Signup failed: {res.text}"
    print("[OK] Signup successful")
    
    # 2. Login
    print("\n2. Logging in")
    res = requests.post(f"{BASE_URL}/api/auth/login", data={
        "username": unique_email,
        "password": password
    })
    assert res.status_code == 200, f"Login failed: {res.text}"
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("[OK] Login successful")
    
    # 3. Check Dashboard (Should be 0s for new user)
    print("\n3. Checking Dashboard for new user")
    res = requests.get(f"{BASE_URL}/api/dashboard/summary", headers=headers)
    assert res.status_code == 200, f"Dashboard failed: {res.text}"
    dash_data = res.json()
    assert dash_data["calories_consumed"] == 0, "New user should have 0 calories consumed"
    assert dash_data["workout_streak"] == 0, "New user should have 0 workout streak"
    print("[OK] Dashboard returns isolated/clean data for new user")
    
    # 4. Log a Workout
    print("\n4. Logging a workout")
    res = requests.post(f"{BASE_URL}/api/workouts/log", headers=headers, json={
        "notes": "Test workout",
        "exercises": [
            {
                "exercise_name": "Test Press",
                "sets": 3,
                "reps": 10,
                "weight": 50.0,
                "rpe": 8.0
            }
        ]
    })
    assert res.status_code in [200, 201], f"Workout log failed: {res.text}"
    print("[OK] Workout logged successfully")
    
    # 5. Log Nutrition
    print("\n5. Logging nutrition")
    res = requests.post(f"{BASE_URL}/api/nutrition/log", headers=headers, json={
        "food_name": "Test Apple",
        "calories": 100,
        "protein": 1.0,
        "carbs": 25.0,
        "fat": 0.5
    })
    assert res.status_code in [200, 201], f"Nutrition log failed: {res.text}"
    print("[OK] Nutrition logged successfully")
    
    # 6. Re-check Dashboard (Should show updated calories and PRs)
    print("\n6. Re-checking Dashboard")
    res = requests.get(f"{BASE_URL}/api/dashboard/summary", headers=headers)
    assert res.status_code == 200
    dash_data = res.json()
    assert dash_data["calories_consumed"] == 100, "Dashboard did not update calories"
    assert len(dash_data["recent_prs"]) == 1, "Dashboard did not update PRs"
    assert dash_data["recent_prs"][0]["exercise"] == "Test Press"
    print("[OK] Dashboard updated successfully with user-specific data")
    
    # 7. Check Analytics
    print("\n7. Checking Analytics")
    res = requests.get(f"{BASE_URL}/api/analytics/progress", headers=headers)
    assert res.status_code == 200
    analytics_data = res.json()
    assert len(analytics_data["volume_data"]) > 0, "Analytics should show volume for the logged workout"
    print("[OK] Analytics fetched successfully")
    
    # 8. Check AI Coach History
    print("\n8. Testing AI Coach chat history")
    res = requests.get(f"{BASE_URL}/api/coach/history", headers=headers)
    assert res.status_code == 200
    history = res.json()
    assert len(history) == 1, "Should have 1 default message"
    
    # Send a message
    res = requests.post(f"{BASE_URL}/api/coach/chat", headers=headers, json={
        "message": "Hello Coach!"
    })
    # Gemini API might fail if key is missing, but endpoint should return 200 with an error string
    assert res.status_code == 200, f"Chat failed: {res.text}"
    
    # Fetch history again
    res = requests.get(f"{BASE_URL}/api/coach/history", headers=headers)
    history = res.json()
    assert len(history) == 2, f"Expected 2 messages in history (user, assistant), got {len(history)}"
    print("[OK] AI Coach stores and retrieves chat history")
    
    print("\n--- All Integration Tests Passed ---")

if __name__ == "__main__":
    run_tests()
