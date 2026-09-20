import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  UserCheck,
  Search,
  Calendar,
  Repeat,
  GraduationCap,
  Handshake,
  BarChart3,
  User,
  ExternalLink,
} from 'lucide-react';

const Sidebar = () => {
  const { isAcademician, subRole } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Post Opportunity', path: '/post-opportunity', icon: PlusCircle, highlight: true },
    { name: 'My Postings', path: '/my-postings', icon: FileText },
    { name: 'Shortlisting', path: '/candidates', icon: UserCheck },
    { name: 'Talent Search', path: '/talent-search', icon: Search },
    { name: 'Mentorship', path: '/mentorship', icon: Calendar },
    { name: 'Skill Exchange', path: '/skill-exchange', icon: Repeat },
    { name: 'Learning Programs', path: '/learning-programs', icon: GraduationCap },
    { name: 'Collaboration Hub', path: '/collaboration', icon: Handshake },
    { name: 'Placement Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Profile & Badges', path: '/profile', icon: User },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 min-h-[calc(100vh-61px)] p-4 flex flex-col justify-between select-none">
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">
          {isAcademician ? 'Academic Administration' : subRole === 'recruiter' ? 'Recruiter Suite' : 'Mentor Suite'}
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-pro-600 text-white shadow-md shadow-pro-600/20 font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.highlight && !isActive && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Cross-Link Card to Student App & Backend */}
      <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">SIH26044 Demo</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          Open student portal in another tab to test real-time application updates:
        </p>
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noreferrer"
          className="mt-2.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-300 hover:text-white font-bold text-[11px] flex items-center justify-between transition-colors border border-white/10"
        >
          <span>Open Student Portal</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
