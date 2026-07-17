import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Dumbbell, Clock, Calendar, Settings } from 'lucide-react';

const WorkoutGenerator = () => {
  const [formData, setFormData] = useState({
    days_per_week: 3,
    duration_minutes: 45,
    experience_level: 'Beginner',
    equipment_available: 'Full Gym'
  });
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/workouts/generate', formData);
      setPlan(res.data.plan);
    } catch (err) {
      console.error("Error generating workout", err);
      setPlan("Sorry, an error occurred while generating the plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-textMain p-4 md:p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Section */}
        <div className="lg:col-span-1 bg-surface p-6 rounded-2xl border border-surfaceHighlight h-fit">
          <div className="flex items-center space-x-3 mb-6">
            <Dumbbell className="text-primary" size={28} />
            <h2 className="text-2xl font-bold">Generate Plan</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-textMuted mb-2">
                <Calendar size={16} />
                <span>Days per Week</span>
              </label>
              <input 
                type="range" min="1" max="7" 
                value={formData.days_per_week}
                onChange={(e) => setFormData({...formData, days_per_week: parseInt(e.target.value)})}
                className="w-full accent-primary"
              />
              <div className="text-right text-lg font-bold text-accent">{formData.days_per_week} Days</div>
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-textMuted mb-2">
                <Clock size={16} />
                <span>Duration (minutes)</span>
              </label>
              <select 
                value={formData.duration_minutes}
                onChange={(e) => setFormData({...formData, duration_minutes: parseInt(e.target.value)})}
                className="w-full bg-background border border-surfaceHighlight rounded-lg p-3 text-textMain focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value={30}>30 mins</option>
                <option value={45}>45 mins</option>
                <option value={60}>60 mins</option>
                <option value={90}>90 mins</option>
              </select>
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-textMuted mb-2">
                <Settings size={16} />
                <span>Experience Level</span>
              </label>
              <select 
                value={formData.experience_level}
                onChange={(e) => setFormData({...formData, experience_level: e.target.value})}
                className="w-full bg-background border border-surfaceHighlight rounded-lg p-3 text-textMain focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-textMuted mb-2">
                <Dumbbell size={16} />
                <span>Equipment Available</span>
              </label>
              <select 
                value={formData.equipment_available}
                onChange={(e) => setFormData({...formData, equipment_available: e.target.value})}
                className="w-full bg-background border border-surfaceHighlight rounded-lg p-3 text-textMain focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option>Full Gym</option>
                <option>Dumbbells Only</option>
                <option>Bodyweight</option>
                <option>Bands</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary hover:bg-primaryHover text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate AI Workout'}
            </button>
          </form>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2 bg-surface p-6 rounded-2xl border border-surfaceHighlight min-h-[600px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
              <p className="text-textMuted animate-pulse">Designing your optimal routine...</p>
            </div>
          ) : plan ? (
            <div className="prose prose-invert max-w-none prose-headings:text-primary prose-a:text-accent">
              <ReactMarkdown>{plan}</ReactMarkdown>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-textMuted space-y-4">
              <Dumbbell size={64} className="opacity-20" />
              <p className="text-xl">Your AI-generated plan will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutGenerator;
