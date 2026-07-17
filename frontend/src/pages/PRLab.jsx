import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Trophy, ArrowUpCircle, Calendar, Edit2, X, Save } from 'lucide-react';

const PRLab = () => {
  const [prs, setPrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ exercise_name: '', weight: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPRs();
  }, []);

  const fetchPRs = async () => {
    try {
      const res = await axios.get('/api/prs');
      setPrs(res.data);
    } catch (err) {
      console.error("Failed to fetch PRs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePR = async () => {
    if (!formData.exercise_name || !formData.weight) {
      setError("Please fill all fields");
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await axios.post('/api/prs', {
        exercise_name: formData.exercise_name,
        weight: parseFloat(formData.weight)
      });
      await fetchPRs();
      setShowModal(false);
      setFormData({ exercise_name: '', weight: '' });
    } catch (err) {
      console.error("Failed to save PR", err);
      setError("Failed to save PR. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPrs = prs.filter(pr => 
    pr.exercise_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-textMain p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Trophy className="text-yellow-500" size={32} />
              PR Lab
            </h1>
            <p className="text-textMuted mt-1">Track your all-time personal bests.</p>
          </div>
          
          <button 
            onClick={() => {
              setFormData({ exercise_name: '', weight: '' });
              setShowModal(true);
            }}
            className="flex items-center space-x-2 bg-primary hover:bg-primaryHover text-white px-5 py-2.5 rounded-xl transition-colors font-medium shadow-lg shadow-primary/20"
          >
            <Plus size={20} />
            <span>Log New PR</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-textMuted" size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Search exercises..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-surface border border-surfaceHighlight rounded-2xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-textMain transition-all shadow-sm"
          />
        </div>

        {/* PR List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredPrs.length === 0 ? (
          <div className="bg-surface p-12 rounded-3xl border border-surfaceHighlight text-center shadow-lg">
            <div className="bg-background rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Trophy className="text-textMuted" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">No PRs found</h3>
            <p className="text-textMuted max-w-md mx-auto">
              {search ? "Try a different search term." : "You haven't logged any personal records yet. Start tracking to see your progress!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrs.map(pr => (
              <div key={pr.id} className="bg-surface p-6 rounded-2xl border border-surfaceHighlight shadow-md hover:shadow-lg transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg text-textMain pr-8">{pr.exercise_name}</h3>
                  <button 
                    onClick={() => {
                      setFormData({ exercise_name: pr.exercise_name, weight: pr.current_weight });
                      setShowModal(true);
                    }}
                    className="text-textMuted hover:text-primary transition-colors p-2 -mr-2 -mt-2"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
                
                <div className="flex items-end gap-3 mb-4">
                  <span className="text-4xl font-black text-primary">{pr.current_weight}</span>
                  <span className="text-lg font-medium text-textMuted mb-1">kg</span>
                </div>

                <div className="space-y-2 pt-4 border-t border-surfaceHighlight/50">
                  {pr.previous_weight && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-textMuted flex items-center gap-1.5">
                        <ArrowUpCircle size={14} className="text-emerald-500" />
                        Previous PR
                      </span>
                      <span className="font-medium text-textMain">{pr.previous_weight} kg</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-textMuted flex items-center gap-1.5">
                      <Calendar size={14} />
                      Achieved
                    </span>
                    <span className="font-medium text-textMain">
                      {new Date(pr.date_achieved).toLocaleDateString(undefined, {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-surface w-full max-w-md rounded-3xl shadow-2xl border border-surfaceHighlight overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-surfaceHighlight">
                <h3 className="font-bold text-xl">{formData.exercise_name ? 'Update PR' : 'Log New PR'}</h3>
                <button onClick={() => setShowModal(false)} className="text-textMuted hover:text-textMain">
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                {error && <div className="p-3 bg-red-500/20 text-red-400 rounded-xl text-sm">{error}</div>}
                
                <div>
                  <label className="block text-sm font-medium text-textMuted mb-1.5">Exercise Name</label>
                  <input 
                    type="text" 
                    value={formData.exercise_name}
                    onChange={(e) => setFormData({...formData, exercise_name: e.target.value})}
                    placeholder="e.g., Bench Press"
                    disabled={!!prs.find(p => p.exercise_name === formData.exercise_name)} // Disable if updating existing
                    className="w-full bg-background border border-surfaceHighlight rounded-xl p-3 text-textMain focus:outline-none focus:border-primary disabled:opacity-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-textMuted mb-1.5">Weight (kg)</label>
                  <input 
                    type="number" 
                    step="0.5"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    placeholder="e.g., 100"
                    className="w-full bg-background border border-surfaceHighlight rounded-xl p-3 text-textMain focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              
              <div className="p-6 pt-0 flex gap-3">
                <button 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-background hover:bg-surfaceHighlight text-textMain rounded-xl font-medium transition-colors border border-surfaceHighlight"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSavePR}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-primary hover:bg-primaryHover text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {isSubmitting ? 'Saving...' : 'Save PR'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PRLab;
