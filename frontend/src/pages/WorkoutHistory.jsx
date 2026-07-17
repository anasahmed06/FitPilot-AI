import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, ChevronDown, ChevronUp, Dumbbell, Clock } from 'lucide-react';

const WorkoutHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get('/api/workouts/history');
        setHistory(res.data.history);
      } catch (err) {
        console.error("Failed to fetch workout history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-textMain p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex items-center space-x-3 mb-8">
          <Calendar className="text-primary" size={32} />
          <h1 className="text-3xl font-bold">Workout History</h1>
        </div>

        {history.length === 0 ? (
          <div className="bg-surface p-12 rounded-2xl border border-surfaceHighlight text-center">
            <Dumbbell className="mx-auto text-textMuted mb-4 opacity-50" size={64} />
            <h2 className="text-2xl font-bold mb-2">No Workouts Yet</h2>
            <p className="text-textMuted">Log your first workout to start tracking your history!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((log) => (
              <div key={log.id} className="bg-surface rounded-xl border border-surfaceHighlight overflow-hidden transition-all">
                <button 
                  onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  className="w-full flex items-center justify-between p-6 hover:bg-surfaceHighlight/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/20 p-3 rounded-xl text-primary">
                      <Clock size={24} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-lg">{log.date}</h3>
                      <p className="text-sm text-textMuted">{log.exercises.length} Exercises Logged</p>
                    </div>
                  </div>
                  <div className="text-textMuted">
                    {expandedId === log.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                  </div>
                </button>
                
                {expandedId === log.id && (
                  <div className="p-6 pt-0 border-t border-surfaceHighlight">
                    {log.notes && (
                      <div className="mb-6 p-4 bg-background rounded-lg text-sm text-textMuted italic border border-surfaceHighlight/50">
                        "{log.notes}"
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      {log.exercises.map((ex, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between bg-background p-4 rounded-lg border border-surfaceHighlight">
                          <div className="font-bold text-lg mb-2 md:mb-0">{ex.name}</div>
                          <div className="flex space-x-6 text-sm">
                            <div>
                              <span className="text-textMuted block text-xs uppercase tracking-wider">Sets</span>
                              <span className="font-medium">{ex.sets}</span>
                            </div>
                            <div>
                              <span className="text-textMuted block text-xs uppercase tracking-wider">Reps</span>
                              <span className="font-medium">{ex.reps}</span>
                            </div>
                            <div>
                              <span className="text-textMuted block text-xs uppercase tracking-wider">Weight</span>
                              <span className="font-medium text-accent">{ex.weight} kg</span>
                            </div>
                            {ex.rpe && (
                              <div>
                                <span className="text-textMuted block text-xs uppercase tracking-wider">RPE</span>
                                <span className="font-medium">{ex.rpe}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
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

export default WorkoutHistory;
