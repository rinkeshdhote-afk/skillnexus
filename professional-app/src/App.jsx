import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PostOpportunity from './pages/PostOpportunity';
import MyPostings from './pages/MyPostings';
import Candidates from './pages/Candidates';
import TalentSearch from './pages/TalentSearch';
import Mentorship from './pages/Mentorship';
import SkillExchange from './pages/SkillExchange';
import LearningPrograms from './pages/LearningPrograms';
import Collaboration from './pages/Collaboration';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';

const ProtectedLayout = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-pro-200 border-t-pro-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-pro-600 selection:text-white">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
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
              path="/dashboard"
              element={
                <ProtectedLayout>
                  <Dashboard />
                </ProtectedLayout>
              }
            />
            <Route
              path="/post-opportunity"
              element={
                <ProtectedLayout>
                  <PostOpportunity />
                </ProtectedLayout>
              }
            />
            <Route
              path="/my-postings"
              element={
                <ProtectedLayout>
                  <MyPostings />
                </ProtectedLayout>
              }
            />
            <Route
              path="/candidates"
              element={
                <ProtectedLayout>
                  <Candidates />
                </ProtectedLayout>
              }
            />
            <Route
              path="/talent-search"
              element={
                <ProtectedLayout>
                  <TalentSearch />
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
              path="/skill-exchange"
              element={
                <ProtectedLayout>
                  <SkillExchange />
                </ProtectedLayout>
              }
            />
            <Route
              path="/learning-programs"
              element={
                <ProtectedLayout>
                  <LearningPrograms />
                </ProtectedLayout>
              }
            />
            <Route
              path="/collaboration"
              element={
                <ProtectedLayout>
                  <Collaboration />
                </ProtectedLayout>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedLayout>
                  <Analytics />
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
