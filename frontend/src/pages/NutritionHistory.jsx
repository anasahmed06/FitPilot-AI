import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Apple, Trash2, Edit2, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NutritionHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDates, setExpandedDates] = useState(new Set());
  
  const [editingLog, setEditingLog] = useState(null);
  const [editFormData, setEditFormData] = useState({ food_name: '', calories: '', protein: '', carbs: '', fat: '', fiber: '' });

  const navigate = useNavigate();

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/nutrition/history');
      setHistory(res.data);
      // Auto-expand the first date
      if (res.data.length > 0) {
        setExpandedDates(new Set([res.data[0].date]));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const toggleDate = (date) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDates(newExpanded);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this log?")) return;
    try {
      await axios.delete(`/api/nutrition/log/${id}`);
      fetchHistory();
    } catch (err) {
      console.error("Failed to delete log", err);
    }
  };

  const startEdit = (log) => {
    setEditingLog(log.id);
    setEditFormData({
      food_name: log.food_name,
      calories: log.calories,
      protein: log.protein,
      carbs: log.carbs,
      fat: log.fat,
      fiber: log.fiber || 0
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/nutrition/log/${editingLog}`, {
        food_name: editFormData.food_name,
        calories: parseInt(editFormData.calories),
        protein: parseFloat(editFormData.protein),
        carbs: parseFloat(editFormData.carbs),
        fat: parseFloat(editFormData.fat),
        fiber: parseFloat(editFormData.fiber)
      });
      setEditingLog(null);
      fetchHistory();
    } catch (err) {
      console.error("Failed to edit log", err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-textMain p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Apple className="text-emerald-500" size={32} />
            <div>
              <h1 className="text-3xl font-bold">Nutrition History</h1>
              <p className="text-textMuted mt-1">Review your past meals and macros.</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/nutrition')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Log Meal
          </button>
        </div>

        {history.length === 0 ? (
          <div className="bg-surface p-12 rounded-2xl border border-surfaceHighlight text-center">
            <Calendar className="text-textMuted mx-auto mb-4" size={48} />
            <h3 className="text-xl font-bold mb-2">No Nutrition History</h3>
            <p className="text-textMuted mb-6">You haven't logged any meals yet. Start tracking to see your history here.</p>
            <button 
              onClick={() => navigate('/nutrition')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold transition-colors"
            >
              Start Logging
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((dayGroup) => (
              <div key={dayGroup.date} className="bg-surface rounded-2xl border border-surfaceHighlight overflow-hidden">
                <button 
                  onClick={() => toggleDate(dayGroup.date)}
                  className="w-full flex items-center justify-between p-4 bg-background/50 hover:bg-surfaceHighlight/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Calendar className="text-emerald-500" size={20} />
                    <span className="font-bold text-lg">{dayGroup.date}</span>
                    <span className="text-sm text-textMuted bg-background px-2 py-1 rounded-full border border-surfaceHighlight">
                      {dayGroup.meals.length} meals
                    </span>
                  </div>
                  {expandedDates.has(dayGroup.date) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                
                {expandedDates.has(dayGroup.date) && (
                  <div className="p-4 border-t border-surfaceHighlight">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-surfaceHighlight text-sm text-textMuted">
                            <th className="pb-3 font-medium">Time</th>
                            <th className="pb-3 font-medium">Food Item</th>
                            <th className="pb-3 font-medium text-right">Calories</th>
                            <th className="pb-3 font-medium text-right">P/C/F/Fb (g)</th>
                            <th className="pb-3 font-medium text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-surfaceHighlight">
                          {dayGroup.meals.map(meal => (
                            <tr key={meal.id} className="text-sm hover:bg-background/50 transition-colors">
                              {editingLog === meal.id ? (
                                <td colSpan={5} className="py-4">
                                  <form onSubmit={handleEditSubmit} className="flex flex-wrap items-center gap-2 bg-background p-4 rounded-xl border border-emerald-500/30">
                                    <input 
                                      required className="bg-surface border border-surfaceHighlight p-2 rounded w-full sm:w-auto flex-1" 
                                      value={editFormData.food_name} onChange={e => setEditFormData({...editFormData, food_name: e.target.value})} 
                                      placeholder="Food Name"
                                    />
                                    <input 
                                      required type="number" className="bg-surface border border-surfaceHighlight p-2 rounded w-20" 
                                      value={editFormData.calories} onChange={e => setEditFormData({...editFormData, calories: e.target.value})} 
                                      placeholder="kcal"
                                    />
                                    <input 
                                      required type="number" step="0.1" className="bg-surface border border-surfaceHighlight p-2 rounded w-16" 
                                      value={editFormData.protein} onChange={e => setEditFormData({...editFormData, protein: e.target.value})} 
                                      placeholder="P"
                                    />
                                    <input 
                                      required type="number" step="0.1" className="bg-surface border border-surfaceHighlight p-2 rounded w-16" 
                                      value={editFormData.carbs} onChange={e => setEditFormData({...editFormData, carbs: e.target.value})} 
                                      placeholder="C"
                                    />
                                    <input 
                                      required type="number" step="0.1" className="bg-surface border border-surfaceHighlight p-2 rounded w-16" 
                                      value={editFormData.fat} onChange={e => setEditFormData({...editFormData, fat: e.target.value})} 
                                      placeholder="F"
                                    />
                                    <input 
                                      required type="number" step="0.1" className="bg-surface border border-surfaceHighlight p-2 rounded w-16" 
                                      value={editFormData.fiber} onChange={e => setEditFormData({...editFormData, fiber: e.target.value})} 
                                      placeholder="Fb"
                                    />
                                    <div className="flex gap-2">
                                      <button type="submit" className="bg-emerald-500 text-white px-3 py-2 rounded font-medium hover:bg-emerald-600">Save</button>
                                      <button type="button" onClick={() => setEditingLog(null)} className="bg-surfaceHighlight text-white px-3 py-2 rounded font-medium hover:bg-surfaceHighlight/80">Cancel</button>
                                    </div>
                                  </form>
                                </td>
                              ) : (
                                <>
                                  <td className="py-4 text-textMuted">{meal.time}</td>
                                  <td className="py-4 font-medium">{meal.food_name}</td>
                                  <td className="py-4 text-right text-orange-400 font-medium">{meal.calories}</td>
                                  <td className="py-4 text-right text-textMuted">
                                    {meal.protein} / {meal.carbs} / {meal.fat} / {meal.fiber || 0}
                                  </td>
                                  <td className="py-4 text-right">
                                    <div className="flex justify-end space-x-2">
                                      <button onClick={() => startEdit(meal)} className="p-2 text-textMuted hover:text-emerald-500 transition-colors">
                                        <Edit2 size={16} />
                                      </button>
                                      <button onClick={() => handleDelete(meal.id)} className="p-2 text-textMuted hover:text-red-500 transition-colors">
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NutritionHistory;
