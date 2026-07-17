import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Apple, Plus, Flame, Activity, Sparkles } from 'lucide-react';

const NutritionPlanner = () => {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
  const [suggestions, setSuggestions] = useState("");
  const [foodInput, setFoodInput] = useState("");
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fetchNutrition = async () => {
    try {
      const res = await axios.get('/api/nutrition/today');
      setLogs(res.data.logs);
      setSummary(res.data.summary);
      setSuggestions(res.data.suggestions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNutrition();
  }, []);

  const handleAddFood = async (e) => {
    e.preventDefault();
    if (!foodInput.trim()) return;
    
    setIsAnalyzing(true);
    setMessage('');
    
    try {
      // 1. Analyze with AI
      const analyzeRes = await axios.post('/api/nutrition/analyze', { food_description: foodInput });
      const macros = analyzeRes.data;
      
      // 2. Save to database
      await axios.post('/api/nutrition/log', macros);
      
      setMessage('Food analyzed and logged successfully!');
      setFoodInput('');
      fetchNutrition();
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Failed to analyze food. Please check your Gemini API Key.');
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-background text-primary"><Flame className="animate-bounce" size={48} /></div>;
  }

  return (
    <div className="min-h-screen bg-background text-textMain p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <Apple className="text-emerald-500" size={32} />
          <div>
            <h1 className="text-3xl font-bold">AI Nutrition Planner</h1>
            <p className="text-textMuted mt-1">Describe your meal, and let Gemini estimate the macros.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Input Section */}
          <div className="lg:col-span-1 bg-surface p-6 rounded-2xl border border-surfaceHighlight h-fit">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Sparkles className="text-primary mr-2" size={20} />
              Log a Meal
            </h2>

            {message && (
              <div className={`p-4 mb-4 rounded-lg text-sm ${message.includes('success') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleAddFood} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textMuted mb-2">What did you eat?</label>
                <textarea 
                  required 
                  rows={4}
                  placeholder="e.g., Chicken Breast 200g, 1 cup of brown rice, and a medium apple"
                  value={foodInput} 
                  onChange={e => setFoodInput(e.target.value)}
                  className="w-full bg-background border border-surfaceHighlight rounded-lg p-4 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isAnalyzing || !foodInput.trim()}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                {isAnalyzing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    <span>Analyze & Log</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Data Section */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* AI Suggestions Box */}
            {suggestions && (
              <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex items-start space-x-4">
                <div className="bg-primary/20 p-2 rounded-full mt-1">
                  <Sparkles className="text-primary" size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-primary mb-1">Coach's Advice</h4>
                  <p className="text-sm text-primary/90 leading-relaxed">{suggestions}</p>
                </div>
              </div>
            )}

            {/* Today's Summary */}
            <div className="bg-surface p-6 rounded-2xl border border-surfaceHighlight">
              <h3 className="text-xl font-bold mb-6">Today's Macros</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-background p-4 rounded-xl border border-surfaceHighlight text-center col-span-2 md:col-span-1">
                  <Flame className="mx-auto text-orange-500 mb-2" size={24} />
                  <p className="text-xs text-textMuted">Calories</p>
                  <p className="text-lg font-bold">{summary.calories}</p>
                </div>
                <div className="bg-background p-4 rounded-xl border border-surfaceHighlight text-center">
                  <Activity className="mx-auto text-emerald-500 mb-2" size={24} />
                  <p className="text-xs text-textMuted">Protein</p>
                  <p className="text-lg font-bold">{summary.protein}g</p>
                </div>
                <div className="bg-background p-4 rounded-xl border border-surfaceHighlight text-center">
                  <div className="w-6 h-6 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                  <p className="text-xs text-textMuted">Carbs</p>
                  <p className="text-lg font-bold">{summary.carbs}g</p>
                </div>
                <div className="bg-background p-4 rounded-xl border border-surfaceHighlight text-center">
                  <div className="w-6 h-6 mx-auto rounded-full bg-yellow-500/20 flex items-center justify-center mb-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  </div>
                  <p className="text-xs text-textMuted">Fat</p>
                  <p className="text-lg font-bold">{summary.fat}g</p>
                </div>
                <div className="bg-background p-4 rounded-xl border border-surfaceHighlight text-center">
                  <div className="w-6 h-6 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center mb-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  </div>
                  <p className="text-xs text-textMuted">Fiber</p>
                  <p className="text-lg font-bold">{summary.fiber || 0}g</p>
                </div>
              </div>
            </div>

            {/* Food Data Table */}
            <div className="bg-surface p-6 rounded-2xl border border-surfaceHighlight overflow-hidden">
              <h3 className="text-xl font-bold mb-4">Today's Log</h3>
              {logs.length === 0 ? (
                <p className="text-textMuted text-center py-8 bg-background rounded-xl border border-surfaceHighlight border-dashed">No food logged today.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-surfaceHighlight text-sm text-textMuted">
                        <th className="pb-3 font-medium">Food Item</th>
                        <th className="pb-3 font-medium text-right">Calories</th>
                        <th className="pb-3 font-medium text-right">Protein</th>
                        <th className="pb-3 font-medium text-right">Carbs</th>
                        <th className="pb-3 font-medium text-right">Fat</th>
                        <th className="pb-3 font-medium text-right">Fiber</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surfaceHighlight">
                      {logs.map((log, idx) => (
                        <tr key={idx} className="text-sm hover:bg-background transition-colors">
                          <td className="py-4 font-medium">{log.food_name}</td>
                          <td className="py-4 text-right text-orange-400 font-medium">{log.calories}</td>
                          <td className="py-4 text-right">{log.protein}g</td>
                          <td className="py-4 text-right">{log.carbs}g</td>
                          <td className="py-4 text-right">{log.fat}g</td>
                          <td className="py-4 text-right">{log.fiber || 0}g</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
};

export default NutritionPlanner;
