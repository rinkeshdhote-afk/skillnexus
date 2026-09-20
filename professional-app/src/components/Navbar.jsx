import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { demoApi } from '../services/api';
import { useToast } from './Toast';
import { Briefcase, LogOut, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';

const Navbar = () => {
  const { user, isAcademician, subRole, logout } = useAuth();
  const [resetting, setResetting] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleResetDemo = async () => {
    if (!window.confirm('Reset database to clean demo state? This will re-seed all 15 students, 25 opportunities, and test data.')) return;
    setResetting(true);
    try {
      await demoApi.resetDatabase();
      toast.success('Database re-seeded cleanly!');
      window.location.reload();
    } catch (err) {
      toast.error('Failed to reset demo data.');
    } finally {
      setResetting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabel = isAcademician
    ? 'Academician'
    : subRole === 'recruiter'
    ? 'Industry Recruiter'
    : 'Industry Mentor';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-all">
      {/* Brand & Role Tag */}
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pro-700 via-pro-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-pro-600/20 group-hover:scale-105 transition-transform">
            <Briefcase className="w-5 h-5 text-pro-50" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                SKILL<span className="text-pro-600">NEXUS</span> <span className="text-xs font-black uppercase text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">PRO</span>
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-500 font-medium -mt-0.5">Industry & Academia Collaboration Portal</p>
          </div>
        </Link>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Cross-Portal Link to Student Portal */}
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noopener noreferrer"
          title="Open SKILLNEXUS Student Portal"
          className="hidden lg:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-brand-50 text-brand-800 border border-brand-200 hover:bg-brand-100 hover:border-brand-300 transition-all shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
          <span>Open Student Portal</span>
          <span className="text-[10px] bg-brand-200/60 text-brand-900 px-1 py-0.2 rounded font-mono">:5173</span>
        </a>

        {/* Reset Demo State Button */}
        <button
          onClick={handleResetDemo}
          disabled={resetting}
          title="Reset database to clean initial state for fresh demo"
          className="hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
          <span>{resetting ? 'Resetting...' : 'Reset Demo'}</span>
        </button>

        {/* Role Badge */}
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 hidden sm:inline-block">
          {roleLabel}
        </span>

        {/* User Pill */}
        <Link
          to="/profile"
          className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-slate-100/80 transition-colors border border-transparent hover:border-slate-200"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs border border-emerald-200">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-900 leading-tight">{user?.name || 'Professional'}</div>
            <div className="text-[11px] text-slate-500 truncate max-w-[130px]">{user?.organization || 'Organization'}</div>
          </div>
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Sign out"
          className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
