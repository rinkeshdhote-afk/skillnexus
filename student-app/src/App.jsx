import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';

// Pages
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Assessment from './pages/Assessment';
import SkillGap from './pages/SkillGap';
import Opportunities from './pages/Opportunities';
import Applications from './pages/Applications';
import Learning from './pages/Learning';
import Mentorship from './pages/Mentorship';
import Portfolio from './pages/Portfolio';
import Profile from './pages/Profile';

const ProtectedLayout = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-brand-500 selection:text-white">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto pb-20 lg:pb-8">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const App = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/onboarding"
              element={
                <ProtectedLayout>
                  <Onboarding />
                </ProtectedLayout>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedLayout>
                  <Dashboard />
                </ProtectedLayout>
              }
            />
            <Route
              path="/assessment"
              element={
                <ProtectedLayout>
                  <Assessment />
                </ProtectedLayout>
              }
            />
            <Route
              path="/skill-gap"
              element={
                <ProtectedLayout>
                  <SkillGap />
                </ProtectedLayout>
              }
            />
            <Route
              path="/opportunities"
              element={
                <ProtectedLayout>
                  <Opportunities />
                </ProtectedLayout>
              }
            />
            <Route
              path="/applications"
              element={
                <ProtectedLayout>
                  <Applications />
                </ProtectedLayout>
              }
            />
            <Route
              path="/learning"
              element={
                <ProtectedLayout>
                  <Learning />
                </ProtectedLayout>
              }
            />
            <Route
              path="/mentorship"
              element={
                <ProtectedLayout>
                  <Mentorship />
                </ProtectedLayout>
              }
            />
            <Route
              path="/portfolio"
              element={
                <ProtectedLayout>
                  <Portfolio />
                </ProtectedLayout>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedLayout>
                  <Profile />
                </ProtectedLayout>
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
