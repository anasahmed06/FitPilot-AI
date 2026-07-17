import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Target, Activity, Flame, Droplets, Moon, Dumbbell, Save, CheckCircle2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Goals = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFormData(res.data);
      } catch (error) {
        console.error("Failed to fetch goals", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const updateForm = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');
    try {
      const payload = {
        target_weight: formData.target_weight ? parseFloat(formData.target_weight) : null,
        target_calories: formData.target_calories ? parseInt(formData.target_calories) : null,
        target_protein: formData.target_protein ? parseInt(formData.target_protein) : null,
        target_water: formData.target_water ? parseFloat(formData.target_water) : null,
        target_sleep: formData.target_sleep ? parseFloat(formData.target_sleep) : null,
        preferred_workout_days: formData.preferred_workout_days ? parseInt(formData.preferred_workout_days) : null,
      };

      const token = localStorage.getItem('token');
      await axios.put('/api/auth/profile', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Goals updated successfully!');
      setTimeout(() => setMessage(''), 4000);
    } catch (error) {
      setMessage('Failed to update goals.');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const GoalCard = ({ icon: Icon, title, description, field, type="number", min, max, step, placeholder, unit }) => (
    <div className="bg-surface rounded-3xl p-6 border border-surfaceHighlight shadow-md flex flex-col justify-between group hover:border-primary/50 transition-colors">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="bg-primary/20 p-2 rounded-xl text-primary">
            <Icon size={20} />
          </div>
          <h3 className="font-bold text-lg">{title}</h3>
        </div>
        <p className="text-sm text-textMuted">{description}</p>
      </div>
      
      <div className="flex items-center space-x-2">
        <input 
          type={type} min={min} max={max} step={step} placeholder={placeholder}
          value={formData[field] || ''} onChange={(e) => updateForm(field, e.target.value)}
          className="flex-1 bg-background border border-surfaceHighlight rounded-2xl p-4 text-textMain text-xl font-bold focus:ring-2 focus:ring-primary focus:outline-none"
        />
        {unit && <span className="font-medium text-textMuted px-2">{unit}</span>}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-primary/20 p-3 rounded-2xl text-primary">
            <Target size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black mb-1">Your Goals</h1>
            <p className="text-textMuted">Set and edit your daily and weekly targets.</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center space-x-2 bg-primary hover:bg-primaryHover text-white px-6 py-2.5 rounded-xl transition-all shadow-lg font-bold disabled:opacity-50"
        >
          {isSaving ? <span className="animate-spin mr-2 border-2 border-t-transparent border-white rounded-full w-4 h-4"></span> : <Save size={18} />}
          <span>{isSaving ? 'Saving...' : 'Save Goals'}</span>
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl flex items-center justify-center font-medium ${message.includes("success") ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
          <CheckCircle2 size={20} className="mr-2" />
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <GoalCard 
          icon={Activity} title="Target Weight" description="Your long-term body weight goal."
          field="target_weight" step="0.1" unit="kg"
        />
        <GoalCard 
          icon={Flame} title="Target Calories" description="Daily calorie intake target."
          field="target_calories" step="10" unit="kcal"
        />
        <GoalCard 
          icon={Dumbbell} title="Target Protein" description="Daily protein intake for muscle."
          field="target_protein" step="1" unit="g"
        />
        <GoalCard 
          icon={Dumbbell} title="Weekly Workouts" description="Number of days you want to train."
          field="preferred_workout_days" min="1" max="7" step="1" unit="days"
        />
        <GoalCard 
          icon={Droplets} title="Water Intake" description="Daily hydration target."
          field="target_water" step="0.1" unit="L"
        />
        <GoalCard 
          icon={Moon} title="Sleep Goal" description="Daily sleep duration target."
          field="target_sleep" step="0.5" unit="hrs"
        />
      </div>
    </div>
  );
};

export default Goals;
