import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Trophy, ArrowUpCircle, Calendar } from 'lucide-react';

const PRLab = () => {
  const [prs, setPrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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
            <p className="text-textMuted mt-1">Your automated wall of fame. Log workouts to see new PRs appear here!</p>
          </div>
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
              {search ? "Try a different search term." : "You haven't achieved any personal records yet. Log a workout to start tracking your progress automatically!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrs.map(pr => (
              <div key={pr.id} className="bg-surface p-6 rounded-2xl border border-surfaceHighlight shadow-md hover:shadow-lg transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg text-textMain pr-8">{pr.exercise_name}</h3>
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
      </div>
    </div>
  );
};

export default PRLab;
