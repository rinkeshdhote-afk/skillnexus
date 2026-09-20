import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, LogOut, User, Bell, Award } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-all">
      {/* Brand & SIH Badge */}
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-indigo-100" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">SKILL<span className="text-brand-600">NEXUS</span></span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200/60">
                Student
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-500 font-medium -mt-0.5">SIH26044 • Academia-Industry Portal</p>
          </div>
        </Link>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Cross-Portal Link to Pro Portal */}
        <a
          href="http://localhost:5174"
          target="_blank"
          rel="noopener noreferrer"
          title="Open SKILLNEXUS Pro Portal (Recruiter, Mentor & Academician)"
          className="hidden lg:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-teal-50 text-teal-800 border border-teal-200/80 hover:bg-teal-100 hover:border-teal-300 transition-all shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Open Pro Portal</span>
          <span className="text-[10px] bg-teal-200/60 text-teal-900 px-1 py-0.2 rounded font-mono">:5174</span>
        </a>

        {user?.student_profile?.assessment_done && (
          <Link
            to="/assessment"
            className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100 transition-colors"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Assessed</span>
          </Link>
        )}

        {/* User Pill */}
        <Link
          to="/profile"
          className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-slate-100/80 transition-colors border border-transparent hover:border-slate-200"
        >
          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs border border-brand-200">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-900 leading-tight">{user?.name || 'Student'}</div>
            <div className="text-[11px] text-slate-500 truncate max-w-[120px]">{user?.organization || 'College'}</div>
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
