import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';

import Dashboard from './pages/Dashboard';
import AICoach from './pages/AICoach';
import WorkoutGenerator from './pages/WorkoutGenerator';
import WorkoutLogger from './pages/WorkoutLogger';
import WorkoutHistory from './pages/WorkoutHistory';
import NutritionPlanner from './pages/NutritionPlanner';
import NutritionHistory from './pages/NutritionHistory';
import ProgressAnalytics from './pages/ProgressAnalytics';
import PRLab from './pages/PRLab';
import OnboardingWizard from './pages/OnboardingWizard';
import ProfileSettings from './pages/ProfileSettings';
import Goals from './pages/Goals';
import WeightTracker from './pages/WeightTracker';

import Navbar from './components/Navbar';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/onboarding" 
              element={
                <ProtectedRoute requireOnboarding={false}>
                  <OnboardingWizard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfileSettings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/goals" 
              element={
                <ProtectedRoute>
                  <Goals />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/weight" 
              element={
                <ProtectedRoute>
                  <WeightTracker />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
          <Route 
            path="/coach" 
            element={
              <ProtectedRoute>
                <AICoach />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/generate-workout" 
            element={
              <ProtectedRoute>
                <WorkoutGenerator />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/log-workout" 
            element={
              <ProtectedRoute>
                <WorkoutLogger />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/history" 
            element={
              <ProtectedRoute>
                <WorkoutHistory />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/nutrition" 
            element={
              <ProtectedRoute>
                <NutritionPlanner />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/nutrition-history" 
            element={
              <ProtectedRoute>
                <NutritionHistory />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <ProgressAnalytics />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/prs" 
            element={
              <ProtectedRoute>
                <PRLab />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
