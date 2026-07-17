import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Activity, Target, Save, Scale, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileSettings = () => {
  const navigate = useNavigate();
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
        console.error("Failed to fetch profile", error);
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
        ...formData,
        age: formData.age ? parseInt(formData.age) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        target_weight: formData.target_weight ? parseFloat(formData.target_weight) : null,
        target_calories: formData.target_calories ? parseInt(formData.target_calories) : null,
        target_protein: formData.target_protein ? parseInt(formData.target_protein) : null,
        target_water: formData.target_water ? parseFloat(formData.target_water) : null,
        target_sleep: formData.target_sleep ? parseFloat(formData.target_sleep) : null,
      };

      const token = localStorage.getItem('token');
      await axios.put('/api/auth/profile', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Profile updated successfully! Smart goals recalculated if left blank.');
      setTimeout(() => setMessage(''), 4000);
    } catch (error) {
      setMessage('Failed to update profile.');
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black mb-2">Profile & Settings</h1>
          <p className="text-textMuted">Update your metrics and tailor your goals.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center space-x-2 bg-primary hover:bg-primaryHover text-white px-6 py-2.5 rounded-xl transition-all shadow-lg font-bold disabled:opacity-50"
        >
          {isSaving ? <span className="animate-spin mr-2 border-2 border-t-transparent border-white rounded-full w-4 h-4"></span> : <Save size={18} />}
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl flex items-center justify-center font-medium ${message.includes("success") ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
          <CheckCircle2 size={20} className="mr-2" />
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Core Metrics */}
        <div className="bg-surface rounded-3xl p-6 border border-surfaceHighlight shadow-md space-y-6">
          <div className="flex items-center space-x-3 mb-4">
            <User className="text-primary" size={24} />
            <h2 className="text-xl font-bold">Core Metrics</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-textMuted mb-2">Age</label>
              <input 
                type="number" value={formData.age || ''} onChange={(e) => updateForm('age', e.target.value)}
                className="w-full bg-background border border-surfaceHighlight rounded-2xl p-3 text-textMain focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textMuted mb-2">Gender</label>
              <select 
                value={formData.gender || ''} onChange={(e) => updateForm('gender', e.target.value)}
                className="w-full appearance-none bg-background border border-surfaceHighlight rounded-2xl p-3 text-textMain focus:ring-2 focus:ring-primary focus:outline-none"
              >
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
                type="number" value={formData.height || ''} onChange={(e) => updateForm('height', e.target.value)}
                className="w-full bg-background border border-surfaceHighlight rounded-2xl p-3 text-textMain focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textMuted mb-2">Weight (kg)</label>
              <input 
                type="number" value={formData.weight || ''} onChange={(e) => updateForm('weight', e.target.value)}
                className="w-full bg-background border border-surfaceHighlight rounded-2xl p-3 text-textMain focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Goals & Targets */}
        <div className="bg-surface rounded-3xl p-6 border border-surfaceHighlight shadow-md space-y-6">
          <div className="flex items-center space-x-3 mb-4">
            <Target className="text-primary" size={24} />
            <h2 className="text-xl font-bold">Targets & Goals</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-textMuted mb-2">Primary Goal</label>
            <select 
                value={formData.goal || ''} onChange={(e) => updateForm('goal', e.target.value)}
                className="w-full appearance-none bg-background border border-surfaceHighlight rounded-2xl p-3 text-textMain focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="Lose Fat">Lose Fat</option>
                <option value="Gain Muscle">Gain Muscle</option>
                <option value="Maintain Weight">Maintain Weight</option>
                <option value="Body Recomposition">Body Recomposition</option>
              </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-textMuted mb-2">Target Weight (kg)</label>
              <input 
                type="number" value={formData.target_weight || ''} onChange={(e) => updateForm('target_weight', e.target.value)}
                className="w-full bg-background border border-surfaceHighlight rounded-2xl p-3 text-textMain focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textMuted mb-2">Target Calories</label>
              <input 
                type="number" value={formData.target_calories || ''} onChange={(e) => updateForm('target_calories', e.target.value)}
                placeholder="Auto-calculated if blank"
                className="w-full bg-background border border-surfaceHighlight rounded-2xl p-3 text-textMain focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-textMuted mb-2">Target Protein (g)</label>
              <input 
                type="number" value={formData.target_protein || ''} onChange={(e) => updateForm('target_protein', e.target.value)}
                placeholder="Auto-calculated if blank"
                className="w-full bg-background border border-surfaceHighlight rounded-2xl p-3 text-textMain focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textMuted mb-2">Target Water (L)</label>
              <input 
                type="number" value={formData.target_water || ''} onChange={(e) => updateForm('target_water', e.target.value)}
                placeholder="Auto-calculated if blank"
                className="w-full bg-background border border-surfaceHighlight rounded-2xl p-3 text-textMain focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfileSettings;
