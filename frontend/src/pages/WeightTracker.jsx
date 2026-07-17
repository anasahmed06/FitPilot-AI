import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Scale, Plus, Trash2, Calendar, Target, TrendingDown, TrendingUp } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const WeightTracker = () => {
  const { user } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [newWeight, setNewWeight] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/weight', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleLogWeight = async () => {
    if (!newWeight) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/weight', { weight: parseFloat(newWeight) }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewWeight('');
      fetchLogs();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/weight/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchLogs();
    } catch (error) {
      console.error(error);
    }
  };

  const chartData = logs.map(log => ({
    date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: log.weight
  }));

  const currentWeight = logs.length > 0 ? logs[logs.length - 1].weight : (user.weight || 0);
  const targetWeight = user.target_weight || 0;
  
  // Calculate Trend
  let trend = "stable";
  if (logs.length >= 2) {
    const diff = logs[logs.length-1].weight - logs[logs.length-2].weight;
    if (diff > 0) trend = "up";
    else if (diff < 0) trend = "down";
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center space-x-3">
        <div className="bg-primary/20 p-3 rounded-2xl text-primary">
          <Scale size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black mb-1">Weight Tracker</h1>
          <p className="text-textMuted">Log your body weight and track progress.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Stats & Input */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary to-primaryHover rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            
            <p className="text-white/80 text-sm font-medium mb-1">Current Weight</p>
            <div className="flex items-end space-x-3">
              <h2 className="text-5xl font-black">{currentWeight.toFixed(1)}</h2>
              <span className="text-xl font-medium pb-1">kg</span>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-white/20 pt-4">
              <div>
                <p className="text-white/70 text-xs">Target</p>
                <p className="font-bold">{targetWeight.toFixed(1)} kg</p>
              </div>
              <div>
                <p className="text-white/70 text-xs">Trend</p>
                <div className="flex items-center space-x-1">
                  {trend === 'down' ? <TrendingDown size={16} /> : trend === 'up' ? <TrendingUp size={16} /> : <Target size={16} />}
                  <span className="font-bold uppercase text-xs">{trend}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-3xl p-6 border border-surfaceHighlight shadow-md">
            <h3 className="font-bold mb-4">Log Today's Weight</h3>
            <div className="flex items-center space-x-4">
              <input 
                type="number" step="0.1" min="30"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="0.0 kg"
                className="flex-1 bg-background border border-surfaceHighlight rounded-2xl p-4 text-textMain text-xl font-bold focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <button 
                onClick={handleLogWeight}
                disabled={!newWeight}
                className="bg-primary hover:bg-primaryHover disabled:opacity-50 text-white p-4 rounded-2xl transition-all shadow-lg"
              >
                <Plus size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Chart & History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface rounded-3xl p-6 border border-surfaceHighlight shadow-md h-80">
            <h3 className="font-bold mb-4">Progress Chart</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="date" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={['auto', 'auto']} stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                    itemStyle={{ color: '#ffffff' }}
                  />
                  <Line type="monotone" dataKey="weight" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-textMuted">
                No weight logs yet. Log your weight to see the chart!
              </div>
            )}
          </div>

          <div className="bg-surface rounded-3xl p-6 border border-surfaceHighlight shadow-md">
            <h3 className="font-bold mb-4">History Log</h3>
            <div className="space-y-2">
              {logs.slice().reverse().map((log) => (
                <div key={log.id} className="flex items-center justify-between p-4 bg-background rounded-2xl border border-surfaceHighlight">
                  <div className="flex items-center space-x-4">
                    <div className="bg-surfaceHighlight/50 p-2 rounded-xl text-textMuted">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-lg">{log.weight.toFixed(1)} kg</p>
                      <p className="text-xs text-textMuted">{new Date(log.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(log.id)}
                    className="text-textMuted hover:text-red-500 hover:bg-red-500/10 p-2 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {logs.length === 0 && (
                <p className="text-center text-textMuted py-4">Your history will appear here.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WeightTracker;
