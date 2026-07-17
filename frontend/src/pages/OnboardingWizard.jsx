import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronRight, ChevronLeft, CheckCircle2, Activity, Target, User, Scale } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';

const OnboardingWizard = () => {
  const navigate = useNavigate();
  const { fetchUser } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    gender: '',
    age: '',
    height: '',
    weight: '',
    target_weight: '',
    goal: '',
    activity_level: '',
    workout_experience: '',
    preferred_workout_days: '',
    workout_duration: '',
    dietary_preference: ''
  });

  const updateForm = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        age: parseInt(formData.age),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        target_weight: formData.target_weight ? parseFloat(formData.target_weight) : null,
        preferred_workout_days: parseInt(formData.preferred_workout_days),
        workout_duration: parseInt(formData.workout_duration),
        is_onboarded: true
      };

      const token = localStorage.getItem('token');
      await axios.put('/api/auth/profile', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await fetchUser();
      navigate('/dashboard');
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-textMain flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-surface/50 backdrop-blur-md rounded-3xl border border-surfaceHighlight p-8 shadow-2xl relative overflow-hidden">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-2 bg-surfaceHighlight w-full">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-in-out"
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>

        <div className="text-center mb-8 pt-4">
          <h1 className="text-3xl font-black mb-2">Welcome to FitPilot</h1>
          <p className="text-textMuted">Let's tailor your experience to hit your goals.</p>
        </div>

        {/* Step 1: Demographics */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="flex items-center space-x-3 mb-6">
              <User className="text-primary" size={24} />
              <h2 className="text-2xl font-bold">Personal Profile</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-textMuted mb-2">Age</label>
                <input 
                  type="number" 
                  value={formData.age} 
                  onChange={(e) => updateForm('age', e.target.value)}
                  className="w-full bg-background border border-surfaceHighlight rounded-2xl p-4 text-textMain focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="e.g. 25"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-textMuted mb-2">Gender</label>
                <select 
                  value={formData.gender}
                  onChange={(e) => updateForm('gender', e.target.value)}
                  className="w-full appearance-none bg-background border border-surfaceHighlight rounded-2xl p-4 text-textMain focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-textMuted mb-2">Height (cm)</label>
                <input 
                  type="number" 
                  value={formData.height} 
                  onChange={(e) => updateForm('height', e.target.value)}
                  className="w-full bg-background border border-surfaceHighlight rounded-2xl p-4 text-textMain focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="e.g. 175"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-textMuted mb-2">Current Weight (kg)</label>
                <input 
                  type="number" 
                  value={formData.weight} 
                  onChange={(e) => updateForm('weight', e.target.value)}
                  className="w-full bg-background border border-surfaceHighlight rounded-2xl p-4 text-textMain focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="e.g. 70"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Goals */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="flex items-center space-x-3 mb-6">
              <Target className="text-primary" size={24} />
              <h2 className="text-2xl font-bold">Your Goals</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-textMuted mb-4">Primary Fitness Goal</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['Lose Fat', 'Gain Muscle', 'Maintain Weight', 'Body Recomposition'].map((goal) => (
                  <button
                    key={goal}
                    onClick={() => updateForm('goal', goal)}
                    className={`p-4 rounded-2xl border transition-all text-left font-medium ${formData.goal === goal ? 'bg-primary/20 border-primary text-primary' : 'bg-background border-surfaceHighlight text-textMuted hover:border-primary/50'}`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            {(formData.goal === 'Lose Fat' || formData.goal === 'Gain Muscle' || formData.goal === 'Body Recomposition') && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <label className="block text-sm font-medium text-textMuted mb-2">Target Weight (kg)</label>
                <input 
                  type="number" 
                  value={formData.target_weight} 
                  onChange={(e) => updateForm('target_weight', e.target.value)}
                  className="w-full bg-background border border-surfaceHighlight rounded-2xl p-4 text-textMain focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="e.g. 65"
                />
              </div>
            )}
          </div>
        )}

        {/* Step 3: Activity & Experience */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="flex items-center space-x-3 mb-6">
              <Activity className="text-primary" size={24} />
              <h2 className="text-2xl font-bold">Activity & Experience</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-textMuted mb-2">Daily Activity Level</label>
              <select 
                value={formData.activity_level}
                onChange={(e) => updateForm('activity_level', e.target.value)}
                className="w-full appearance-none bg-background border border-surfaceHighlight rounded-2xl p-4 text-textMain focus:ring-2 focus:ring-primary focus:outline-none mb-4"
              >
                <option value="">Select Level</option>
                <option value="Sedentary">Sedentary (Office job, little exercise)</option>
                <option value="Light">Light (Light exercise 1-3 days/week)</option>
                <option value="Moderate">Moderate (Moderate exercise 3-5 days/week)</option>
                <option value="Active">Active (Hard exercise 6-7 days/week)</option>
                <option value="Very Active">Very Active (Physical job or training twice a day)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-textMuted mb-2">Workout Experience</label>
              <select 
                value={formData.workout_experience}
                onChange={(e) => updateForm('workout_experience', e.target.value)}
                className="w-full appearance-none bg-background border border-surfaceHighlight rounded-2xl p-4 text-textMain focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="">Select Experience</option>
                <option value="Beginner">Beginner (&lt; 1 year)</option>
                <option value="Intermediate">Intermediate (1-3 years)</option>
                <option value="Advanced">Advanced (3+ years)</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 4: Schedule & Diet */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="flex items-center space-x-3 mb-6">
              <Scale className="text-primary" size={24} />
              <h2 className="text-2xl font-bold">Schedule & Diet</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-textMuted mb-2">Workout Days / Week</label>
                <input 
                  type="number" 
                  min="1" max="7"
                  value={formData.preferred_workout_days} 
                  onChange={(e) => updateForm('preferred_workout_days', e.target.value)}
                  className="w-full bg-background border border-surfaceHighlight rounded-2xl p-4 text-textMain focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="e.g. 4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-textMuted mb-2">Duration (mins)</label>
                <input 
                  type="number" 
                  step="15"
                  value={formData.workout_duration} 
                  onChange={(e) => updateForm('workout_duration', e.target.value)}
                  className="w-full bg-background border border-surfaceHighlight rounded-2xl p-4 text-textMain focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="e.g. 60"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-textMuted mb-2">Dietary Preference (Optional)</label>
              <select 
                value={formData.dietary_preference}
                onChange={(e) => updateForm('dietary_preference', e.target.value)}
                className="w-full appearance-none bg-background border border-surfaceHighlight rounded-2xl p-4 text-textMain focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="None">None</option>
                <option value="Vegan">Vegan</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Keto">Keto</option>
                <option value="Paleo">Paleo</option>
              </select>
            </div>
            
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl">
              <p className="text-sm text-primary font-medium text-center">
                We'll automatically calculate your daily Calorie, Protein, and Water goals based on these answers!
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-surfaceHighlight">
          {step > 1 ? (
            <button 
              onClick={handlePrev}
              className="flex items-center space-x-2 text-textMuted hover:text-textMain font-medium transition-colors"
            >
              <ChevronLeft size={20} />
              <span>Back</span>
            </button>
          ) : <div></div>}

          {step < 4 ? (
            <button 
              onClick={handleNext}
              disabled={
                (step === 1 && (!formData.age || !formData.gender || !formData.height || !formData.weight)) ||
                (step === 2 && !formData.goal) ||
                (step === 3 && (!formData.activity_level || !formData.workout_experience))
              }
              className="flex items-center space-x-2 bg-primary hover:bg-primaryHover text-white px-6 py-3 rounded-xl transition-all shadow-lg disabled:opacity-50 font-bold"
            >
              <span>Continue</span>
              <ChevronRight size={20} />
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.preferred_workout_days || !formData.workout_duration}
              className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 font-bold"
            >
              {isSubmitting ? 'Finalizing...' : 'Complete Profile'}
              {!isSubmitting && <CheckCircle2 size={20} />}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default OnboardingWizard;
