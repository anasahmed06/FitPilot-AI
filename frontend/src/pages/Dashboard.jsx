import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Activity, Target, Flame, Dumbbell, Trophy, Play, Utensils, ChevronRight, Droplets } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardCard = ({ title, value, icon, subtitle }) => (
  <div className="bg-surface p-6 rounded-xl border border-surfaceHighlight shadow-lg">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-textMuted mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-textMain">{value}</h3>
        {subtitle && <p className="text-xs text-textMuted mt-1">{subtitle}</p>}
      </div>
      <div className="p-3 bg-background rounded-full text-primary">
        {icon}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get('/api/dashboard/summary');
        setData(res.data);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  }

  if (loading || !data) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-textMain">


      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-textMuted mt-2">Here's your fitness overview for today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard 
            title="Weight Goal" 
            value={`${data.current_weight} kg`} 
            subtitle={`Target: ${data.goal_weight} kg`}
            icon={<Target size={24} />} 
          />
          <DashboardCard 
            title="Calories" 
            value={data.calories_consumed} 
            subtitle={`Target: ${data.calories_target} kcal`}
            icon={<Flame size={24} className="text-orange-500" />} 
          />
          <DashboardCard 
            title="Protein" 
            value={`${data.protein_consumed}g`} 
            subtitle={`Target: ${data.protein_target}g`}
            icon={<Activity size={24} className="text-emerald-500" />} 
          />
          <DashboardCard 
            title="Workout Streak" 
            value={`${data.workout_streak} Days`} 
            subtitle="Keep it up!"
            icon={<Trophy size={24} className="text-yellow-500" />} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Today's Workout Quick Start */}
            <div className="bg-gradient-to-br from-primary to-primaryHover p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold mb-4">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Ready to Start</span>
                  </div>
                  <h2 className="text-3xl font-black mb-2">Today's Workout</h2>
                  
                  <div className="flex items-center space-x-6 text-sm text-white/90">
                    <div className="flex items-center space-x-1.5">
                      <Play size={16} />
                      <span>~45 Min Duration</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Activity size={16} />
                      <span>Full Body Split</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => navigate('/nutrition')}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white p-4 rounded-2xl flex items-center justify-center transition-all hover:scale-105 shadow-lg"
                    title="Log Nutrition"
                  >
                    <Utensils size={24} />
                  </button>
                  <button 
                    onClick={() => navigate('/log-workout')}
                    className="bg-white text-primary hover:bg-surfaceHighlight p-4 px-8 rounded-2xl flex items-center justify-center transition-all hover:scale-105 shadow-xl font-bold text-lg gap-2"
                  >
                    <Play size={20} className="fill-current" />
                    Quick Start
                  </button>
                </div>
              </div>
            </div>

            {/* Nutrition Summary */}
            <div className="bg-surface p-6 rounded-2xl border border-surfaceHighlight">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">Daily Nutrition</h3>
                <span className="text-sm font-medium text-primary">
                  {data.calories_consumed > 0 
                    ? `${Math.round((data.calories_consumed / data.calories_target) * 100)}% of Goal`
                    : "No meals logged"}
                </span>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-textMuted">Calories</span>
                    <span className="font-bold">{data.calories_consumed} / {data.calories_target} kcal</span>
                  </div>
                  <div className="h-3 w-full bg-background rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-1000" 
                      style={{ width: `${Math.min((data.calories_consumed / data.calories_target) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-textMuted">Protein</span>
                    <span className="font-bold">{data.protein_consumed} / {data.protein_target} g</span>
                  </div>
                  <div className="h-3 w-full bg-background rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent rounded-full transition-all duration-1000" 
                      style={{ width: `${Math.min((data.protein_consumed / data.protein_target) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-textMuted">Water</span>
                    <span className="font-bold">{data.water_consumed} / {data.water_target} L</span>
                  </div>
                  <div className="h-3 w-full bg-background rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-1000" 
                      style={{ width: `${Math.min((data.water_consumed / data.water_target) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Workouts */}
            <div className="bg-surface p-6 rounded-2xl border border-surfaceHighlight">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">Recent Workouts</h3>
                <button 
                  onClick={() => navigate('/history')}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  View All
                </button>
              </div>
              
              {!data.recent_workouts || data.recent_workouts.length === 0 ? (
                <div className="text-center py-6">
                  <div className="bg-background rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <Dumbbell className="text-textMuted" size={20} />
                  </div>
                  <p className="text-textMuted text-sm">No workouts logged recently.</p>
                  <p className="text-textMuted text-sm">Time to hit the gym!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.recent_workouts.map((workout, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-background rounded-xl border border-surfaceHighlight">
                      <div className="flex items-center space-x-4">
                        <div className="bg-primary/20 text-primary p-2 rounded-lg">
                          <Activity size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{workout.date}</p>
                          <p className="text-xs text-textMuted truncate max-w-[200px]">{workout.preview}</p>
                        </div>
                      </div>
                      <button onClick={() => navigate('/history')} className="text-textMuted hover:text-primary">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            
            <div className="bg-surface p-6 rounded-2xl border border-surfaceHighlight">
              <h3 className="font-bold text-lg mb-4">Current Goal</h3>
              <div className="flex items-center space-x-4 p-4 bg-primary/10 rounded-xl border border-primary/20">
                <Target className="text-primary" size={32} />
                <div>
                  <p className="font-bold text-lg">{data.current_goal || "General Fitness"}</p>
                  <p className="text-sm text-textMuted">Keep pushing forward!</p>
                </div>
              </div>
            </div>

            {/* AI Recommendation */}
            <div className="bg-surface p-6 rounded-2xl border border-surfaceHighlight">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center">
                  <Flame className="text-primary mr-2" size={20} />
                  Coach's Insight
                </h3>
              </div>
              <div className="p-4 bg-background rounded-xl border border-surfaceHighlight">
                <p className="text-sm text-textMuted leading-relaxed">
                  {data.ai_recommendation || "Keep up the great work! Consistent tracking leads to consistent results."}
                </p>
              </div>
            </div>

            {/* Personal Records */}
            <div className="bg-surface p-6 rounded-2xl border border-surfaceHighlight">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Personal Records</h3>
                <Trophy className="text-yellow-500" size={20} />
              </div>
              <div className="bg-background rounded-xl p-6 text-center border border-surfaceHighlight">
                <p className="text-sm text-textMuted mb-4">Track your all-time best lifts in the PR Lab.</p>
                <button 
                  onClick={() => navigate('/prs')}
                  className="w-full bg-primary/10 hover:bg-primary/20 text-primary font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Trophy size={16} />
                  Open PR Lab
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
