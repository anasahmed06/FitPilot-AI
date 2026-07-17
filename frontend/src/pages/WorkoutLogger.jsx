import React, { useState } from 'react';
import axios from 'axios';
import { Plus, Trash2, Dumbbell, Save, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MUSCLE_GROUPS = {
  Chest: ['Bench Press', 'Incline Dumbbell Press', 'Cable Crossover', 'Push-ups', 'Pec Deck'],
  Back: ['Pull-ups', 'Lat Pulldown', 'Barbell Row', 'Deadlift', 'Face Pulls'],
  Shoulders: ['Overhead Press', 'Lateral Raises', 'Front Raises', 'Reverse Pec Deck', 'Arnold Press'],
  Legs: ['Squat', 'Leg Press', 'Romanian Deadlift', 'Leg Extension', 'Calf Raises'],
  Biceps: ['Barbell Curl', 'Dumbbell Curl', 'Hammer Curl', 'Preacher Curl', 'Cable Curl'],
  Triceps: ['Tricep Pushdown', 'Overhead Tricep Extension', 'Skullcrushers', 'Dips', 'Close-Grip Bench Press'],
  Core: ['Crunches', 'Plank', 'Leg Raises', 'Russian Twists', 'Ab Wheel Rollout']
};

const WorkoutLogger = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState([
    { muscle_group: '', exercise_name: '', custom_exercise: '', sets: '', reps: '', weight: '', rpe: '' }
  ]);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addExercise = () => {
    setExercises([...exercises, { muscle_group: '', exercise_name: '', custom_exercise: '', sets: '', reps: '', weight: '', rpe: '' }]);
  };

  const removeExercise = (index) => {
    const newExercises = exercises.filter((_, i) => i !== index);
    setExercises(newExercises);
  };

  const updateExercise = (index, field, value) => {
    const newExercises = [...exercises];
    newExercises[index][field] = value;
    
    if (field === 'muscle_group') {
      newExercises[index]['exercise_name'] = '';
      newExercises[index]['custom_exercise'] = '';
    }
    if (field === 'exercise_name' && value !== 'Custom') {
      newExercises[index]['custom_exercise'] = '';
    }
    
    setExercises(newExercises);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const validExercises = exercises.filter(ex => 
        (ex.exercise_name && ex.exercise_name !== 'Custom') || (ex.exercise_name === 'Custom' && ex.custom_exercise)
      ).map(ex => ({
        exercise_name: ex.exercise_name === 'Custom' ? ex.custom_exercise : ex.exercise_name,
        sets: parseInt(ex.sets) || 0,
        reps: parseInt(ex.reps) || 0,
        weight: parseFloat(ex.weight) || 0.0,
        rpe: parseFloat(ex.rpe) || null
      }));

      if (validExercises.length === 0) {
        setMessage("Please add at least one valid exercise.");
        setIsSubmitting(false);
        setTimeout(() => setMessage(''), 3000);
        return;
      }

      const payload = { notes, exercises: validExercises };
      await axios.post('/api/workouts/log', payload);
      
      // Auto post PRs for valid exercises
      for (const ex of validExercises) {
        if (ex.weight > 0) {
          try {
            await axios.post('/api/prs', { exercise_name: ex.exercise_name, weight: ex.weight });
          } catch (e) {
            console.error("Error silently updating PRs", e);
          }
        }
      }

      setMessage("Workout logged successfully! Great job.");
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      console.error(err);
      setMessage("Failed to log workout.");
      setIsSubmitting(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-background text-textMain pb-20">
      
      {/* Header Sticky Bar */}
      <div className="sticky top-16 z-40 bg-surface/90 backdrop-blur-md border-b border-surfaceHighlight py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/20 p-2 rounded-xl text-primary">
              <Dumbbell size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Current Workout</h2>
              <p className="text-xs text-textMuted">Log your sets, reps, and weights.</p>
            </div>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center space-x-2 bg-primary hover:bg-primaryHover disabled:opacity-50 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-primary/20 font-bold"
          >
            <CheckCircle2 size={18} />
            <span className="hidden sm:inline">{isSubmitting ? 'Saving...' : 'Finish Workout'}</span>
            <span className="sm:hidden">{isSubmitting ? '...' : 'Finish'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8 space-y-8">
        
        {message && (
          <div className={`p-4 rounded-2xl flex items-center justify-center font-medium ${message.includes("success") ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
            {message}
          </div>
        )}

        <div className="space-y-6">
          {exercises.map((ex, idx) => (
            <div key={idx} className="bg-surface rounded-3xl border border-surfaceHighlight shadow-md overflow-hidden transition-all group">
              
              {/* Exercise Header */}
              <div className="bg-surfaceHighlight/30 px-6 py-4 flex justify-between items-center border-b border-surfaceHighlight">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  <h3 className="font-bold text-lg">
                    {ex.exercise_name === 'Custom' && ex.custom_exercise ? ex.custom_exercise : (ex.exercise_name || 'Select Exercise')}
                  </h3>
                </div>
                {exercises.length > 1 && (
                  <button 
                    onClick={() => removeExercise(idx)}
                    className="text-textMuted hover:bg-red-500/10 hover:text-red-500 p-2 rounded-lg transition-colors"
                    title="Remove Exercise"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              {/* Step-by-Step Vertical Flow */}
              <div className="p-6 space-y-6">
                
                {/* Step 1 & 2: Muscle Group and Exercise */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-textMuted mb-2">1. Target Muscle</label>
                    <div className="relative">
                      <select
                        value={ex.muscle_group}
                        onChange={(e) => updateExercise(idx, 'muscle_group', e.target.value)}
                        className="w-full appearance-none bg-background border border-surfaceHighlight rounded-2xl p-4 text-textMain focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-sm"
                      >
                        <option value="">Select Muscle Group</option>
                        {Object.keys(MUSCLE_GROUPS).map(group => (
                          <option key={group} value={group}>{group}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-4 text-textMuted pointer-events-none" size={20} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-textMuted mb-2">2. Exercise</label>
                    <div className="relative">
                      <select
                        value={ex.exercise_name}
                        onChange={(e) => updateExercise(idx, 'exercise_name', e.target.value)}
                        disabled={!ex.muscle_group}
                        className="w-full appearance-none bg-background border border-surfaceHighlight rounded-2xl p-4 text-textMain focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-sm disabled:opacity-50"
                      >
                        <option value="">Select Exercise</option>
                        {ex.muscle_group && MUSCLE_GROUPS[ex.muscle_group].map(name => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                        <option value="Custom">Custom Exercise...</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-4 text-textMuted pointer-events-none" size={20} />
                    </div>
                  </div>
                </div>

                {/* Custom Exercise Input (Conditional) */}
                {ex.exercise_name === 'Custom' && (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <label className="block text-sm font-medium text-textMuted mb-2">Custom Exercise Name</label>
                    <input
                      type="text"
                      value={ex.custom_exercise}
                      onChange={(e) => updateExercise(idx, 'custom_exercise', e.target.value)}
                      placeholder="e.g. Incline Bench Press"
                      className="w-full bg-background border border-surfaceHighlight rounded-2xl p-4 text-textMain focus:ring-2 focus:ring-primary focus:outline-none shadow-sm"
                    />
                  </div>
                )}

                {/* Step 3: Metrics (Weight, Sets, Reps, RPE) */}
                <div className="pt-4 border-t border-surfaceHighlight">
                  <label className="block text-sm font-medium text-textMuted mb-4">3. Set Metrics</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    
                    <div className="bg-background rounded-2xl border border-surfaceHighlight p-2 focus-within:ring-2 focus-within:ring-primary transition-all">
                      <label className="block text-xs text-center text-textMuted mb-1 font-medium">Weight (kg)</label>
                      <input
                        type="number" min="0" step="0.5" placeholder="0.0"
                        value={ex.weight}
                        onChange={(e) => updateExercise(idx, 'weight', e.target.value)}
                        className="w-full bg-transparent text-center text-xl font-bold text-textMain focus:outline-none placeholder-textMuted/30"
                      />
                    </div>
                    
                    <div className="bg-background rounded-2xl border border-surfaceHighlight p-2 focus-within:ring-2 focus-within:ring-primary transition-all">
                      <label className="block text-xs text-center text-textMuted mb-1 font-medium">Sets</label>
                      <input
                        type="number" min="0" placeholder="0"
                        value={ex.sets}
                        onChange={(e) => updateExercise(idx, 'sets', e.target.value)}
                        className="w-full bg-transparent text-center text-xl font-bold text-textMain focus:outline-none placeholder-textMuted/30"
                      />
                    </div>

                    <div className="bg-background rounded-2xl border border-surfaceHighlight p-2 focus-within:ring-2 focus-within:ring-primary transition-all">
                      <label className="block text-xs text-center text-textMuted mb-1 font-medium">Reps</label>
                      <input
                        type="number" min="0" placeholder="0"
                        value={ex.reps}
                        onChange={(e) => updateExercise(idx, 'reps', e.target.value)}
                        className="w-full bg-transparent text-center text-xl font-bold text-textMain focus:outline-none placeholder-textMuted/30"
                      />
                    </div>

                    <div className="bg-background rounded-2xl border border-surfaceHighlight p-2 focus-within:ring-2 focus-within:ring-primary transition-all">
                      <label className="block text-xs text-center text-textMuted mb-1 font-medium">RPE</label>
                      <input
                        type="number" min="1" max="10" step="0.5" placeholder="1-10"
                        value={ex.rpe}
                        onChange={(e) => updateExercise(idx, 'rpe', e.target.value)}
                        className="w-full bg-transparent text-center text-xl font-bold text-textMain focus:outline-none placeholder-textMuted/30"
                      />
                    </div>

                  </div>
                </div>

              </div>
            </div>
          ))}

          <button 
            onClick={addExercise}
            className="w-full flex items-center justify-center space-x-2 py-6 border-2 border-dashed border-surfaceHighlight rounded-3xl text-textMuted hover:text-textMain hover:border-primary hover:bg-primary/5 transition-all font-medium text-lg"
          >
            <Plus size={24} />
            <span>Add Another Exercise</span>
          </button>

          {/* Final Step: Notes */}
          <div className="bg-surface rounded-3xl border border-surfaceHighlight p-6 shadow-md">
            <label className="block font-bold text-lg mb-2">Workout Notes</label>
            <p className="text-sm text-textMuted mb-4">How did the session feel? Did you hit any new records?</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Felt great today, PR on the bench press!"
              rows="4"
              className="w-full bg-background border border-surfaceHighlight rounded-2xl p-4 text-textMain focus:ring-2 focus:ring-primary focus:outline-none resize-none shadow-sm"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutLogger;
