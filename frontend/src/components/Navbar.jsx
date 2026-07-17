import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Dumbbell, Activity, Flame, MessageSquare, PlusSquare, LayoutDashboard, History, Trophy, Menu, X, User as UserIcon, LogOut, ChevronDown, Settings, Scale, Target, MoreHorizontal } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWorkoutsOpen, setIsWorkoutsOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, children }) => (
    <Link 
      to={to} 
      onClick={() => setIsMobileMenuOpen(false)}
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors font-medium text-sm ${isActive(to) ? 'bg-primary/10 text-primary' : 'text-textMuted hover:bg-surfaceHighlight hover:text-textMain'}`}
    >
      <Icon size={18} />
      <span>{children}</span>
    </Link>
  );

  return (
    <nav className="border-b border-surfaceHighlight bg-surface/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/dashboard" className="flex items-center space-x-2 group">
              <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
                <Dumbbell className="h-6 w-6 text-primary" />
              </div>
              <span className="font-bold text-xl tracking-tight text-textMain hidden sm:block">FitPilot<span className="text-primary">.AI</span></span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <NavLink to="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
            
            {/* Workouts Dropdown */}
            <div className="relative">
              <button 
                onClick={() => { setIsWorkoutsOpen(!isWorkoutsOpen); setIsMoreOpen(false); }}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors font-medium text-sm ${(isActive('/log-workout') || isActive('/history') || isActive('/generate-workout')) ? 'bg-primary/10 text-primary' : 'text-textMuted hover:bg-surfaceHighlight hover:text-textMain'}`}
              >
                <Dumbbell size={18} />
                <span>Workouts</span>
                <ChevronDown size={14} className={`transition-transform ${isWorkoutsOpen ? 'rotate-180' : ''}`} />
              </button>

              {isWorkoutsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsWorkoutsOpen(false)}></div>
                  <div className="absolute left-0 mt-2 w-48 bg-surface border border-surfaceHighlight rounded-xl shadow-xl z-50 py-2">
                    <Link to="/log-workout" onClick={() => setIsWorkoutsOpen(false)} className="flex items-center space-x-2 px-4 py-2 hover:bg-surfaceHighlight text-sm text-textMain">
                      <PlusSquare size={16} className="text-primary" />
                      <span>Log Workout</span>
                    </Link>
                    <Link to="/generate-workout" onClick={() => setIsWorkoutsOpen(false)} className="flex items-center space-x-2 px-4 py-2 hover:bg-surfaceHighlight text-sm text-textMain">
                      <Target size={16} className="text-primary" />
                      <span>AI Generator</span>
                    </Link>
                    <Link to="/history" onClick={() => setIsWorkoutsOpen(false)} className="flex items-center space-x-2 px-4 py-2 hover:bg-surfaceHighlight text-sm text-textMain">
                      <History size={16} className="text-primary" />
                      <span>History</span>
                    </Link>
                  </div>
                </>
              )}
            </div>

            <NavLink to="/nutrition" icon={Flame}>Nutrition</NavLink>
            <NavLink to="/coach" icon={MessageSquare}>AI Coach</NavLink>
          </div>

          {/* Desktop Profile & More Menu */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <button 
                onClick={() => { setIsMoreOpen(!isMoreOpen); setIsWorkoutsOpen(false); }}
                className="flex items-center justify-center p-2 rounded-full text-textMuted hover:text-textMain hover:bg-surfaceHighlight transition-colors"
                title="More"
              >
                <MoreHorizontal size={20} />
              </button>

              {isMoreOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsMoreOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-56 bg-surface border border-surfaceHighlight rounded-xl shadow-xl z-50 py-2">
                    <div className="px-4 py-2 border-b border-surfaceHighlight mb-2">
                      <p className="text-sm font-bold text-textMain truncate">{user.name || "User"}</p>
                      <p className="text-xs text-textMuted truncate">{user.email}</p>
                    </div>
                    <Link to="/goals" onClick={() => setIsMoreOpen(false)} className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-surfaceHighlight text-sm text-textMain transition-colors">
                      <Target size={16} className="text-textMuted" />
                      <span>Goals</span>
                    </Link>
                    <Link to="/weight" onClick={() => setIsMoreOpen(false)} className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-surfaceHighlight text-sm text-textMain transition-colors">
                      <Scale size={16} className="text-textMuted" />
                      <span>Weight Tracker</span>
                    </Link>
                    <Link to="/analytics" onClick={() => setIsMoreOpen(false)} className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-surfaceHighlight text-sm text-textMain transition-colors">
                      <Activity size={16} className="text-textMuted" />
                      <span>Progress Analytics</span>
                    </Link>
                    <Link to="/prs" onClick={() => setIsMoreOpen(false)} className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-surfaceHighlight text-sm text-textMain transition-colors">
                      <Trophy size={16} className="text-textMuted" />
                      <span>PR Lab</span>
                    </Link>
                    <div className="border-t border-surfaceHighlight my-2"></div>
                    <Link to="/profile" onClick={() => setIsMoreOpen(false)} className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-surfaceHighlight text-sm text-textMain transition-colors">
                      <Settings size={16} className="text-textMuted" />
                      <span>Profile & Settings</span>
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-red-500/10 hover:text-red-500 text-sm text-textMain transition-colors">
                      <LogOut size={16} className="text-red-500" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-textMuted hover:text-textMain p-2"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-surface border-b border-surfaceHighlight px-4 pt-2 pb-6 space-y-1 shadow-lg absolute w-full max-h-[calc(100vh-64px)] overflow-y-auto">
          <div className="px-3 py-3 border-b border-surfaceHighlight mb-2">
            <p className="font-bold text-textMain">{user.name || user.email.split('@')[0]}</p>
            <p className="text-sm text-textMuted">{user.email}</p>
          </div>
          <NavLink to="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
          
          <div className="pt-2 mt-2 border-t border-surfaceHighlight">
            <p className="px-3 text-xs font-bold text-textMuted uppercase mb-1">Workouts</p>
            <NavLink to="/log-workout" icon={PlusSquare}>Log Workout</NavLink>
            <NavLink to="/generate-workout" icon={Dumbbell}>AI Generator</NavLink>
            <NavLink to="/history" icon={History}>History</NavLink>
          </div>

          <div className="pt-2 mt-2 border-t border-surfaceHighlight">
            <NavLink to="/nutrition" icon={Flame}>Nutrition</NavLink>
            <NavLink to="/coach" icon={MessageSquare}>AI Coach</NavLink>
          </div>

          <div className="pt-2 mt-2 border-t border-surfaceHighlight">
            <p className="px-3 text-xs font-bold text-textMuted uppercase mb-1">More</p>
            <NavLink to="/goals" icon={Target}>Goals</NavLink>
            <NavLink to="/weight" icon={Scale}>Weight Tracker</NavLink>
            <NavLink to="/analytics" icon={Activity}>Progress Analytics</NavLink>
            <NavLink to="/prs" icon={Trophy}>PR Lab</NavLink>
          </div>

          <div className="pt-2 mt-2 border-t border-surfaceHighlight">
            <Link 
              to="/profile" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-textMain hover:bg-surfaceHighlight font-medium text-sm transition-colors"
            >
              <Settings size={18} />
              <span>Profile & Settings</span>
            </Link>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-red-500 hover:bg-red-500/10 font-medium text-sm transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
