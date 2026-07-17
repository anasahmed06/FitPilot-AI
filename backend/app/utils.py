def calculate_tdee(weight: float, height: float, age: int, gender: str, activity_level: str) -> int:
    if not all([weight, height, age, gender]):
        return 2000 # Fallback default
        
    # Mifflin-St Jeor Equation
    base_bmr = (10 * weight) + (6.25 * height) - (5 * age)
    if gender.lower() == 'male':
        bmr = base_bmr + 5
    else:
        bmr = base_bmr - 161
        
    multipliers = {
        'Sedentary': 1.2,
        'Light': 1.375,
        'Moderate': 1.55,
        'Active': 1.725,
        'Very Active': 1.9
    }
    multiplier = multipliers.get(activity_level, 1.2)
    return int(bmr * multiplier)

def calculate_protein_goal(weight: float, goal: str) -> int:
    if not weight:
        return 150
        
    if goal == 'Gain Muscle':
        return int(weight * 2.0)
    elif goal == 'Lose Fat':
        return int(weight * 2.2) # Higher protein to preserve muscle during deficit
    else:
        return int(weight * 1.8)

def calculate_water_goal(weight: float, workout_duration: int) -> float:
    if not weight:
        return 2.5
        
    base_water_liters = (weight * 35) / 1000 # 35ml per kg
    
    # Add 0.5L for every 30 mins of workout duration
    if workout_duration:
        extra_water = (workout_duration / 30) * 0.5
        base_water_liters += extra_water
        
    return round(base_water_liters, 1)

def apply_smart_defaults(user_data: dict) -> dict:
    # Calculate calories if not provided
    if not user_data.get('target_calories'):
        tdee = calculate_tdee(
            user_data.get('weight'),
            user_data.get('height'),
            user_data.get('age'),
            user_data.get('gender'),
            user_data.get('activity_level')
        )
        
        goal = user_data.get('goal')
        if goal == 'Lose Fat':
            user_data['target_calories'] = tdee - 500
        elif goal == 'Gain Muscle':
            user_data['target_calories'] = tdee + 300
        else:
            user_data['target_calories'] = tdee
            
    # Calculate protein if not provided
    if not user_data.get('target_protein'):
        user_data['target_protein'] = calculate_protein_goal(user_data.get('weight'), user_data.get('goal'))
        
    # Calculate water if not provided
    if not user_data.get('target_water'):
        user_data['target_water'] = calculate_water_goal(user_data.get('weight'), user_data.get('workout_duration'))
        
    return user_data
