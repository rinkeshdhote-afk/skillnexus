import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  TrendingUp,
  Briefcase,
  FolderClock,
  GraduationCap,
  Users,
  Award,
  User,
  ExternalLink,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Skill Assessment', path: '/assessment', icon: CheckSquare, badge: 'Quiz' },
  { name: 'Skill Gap Analysis', path: '/skill-gap', icon: TrendingUp },
  { name: 'Opportunities', path: '/opportunities', icon: Briefcase },
  { name: 'My Applications', path: '/applications', icon: FolderClock },
  { name: 'Learning Programs', path: '/learning', icon: GraduationCap },
  { name: 'Mentors & Exchange', path: '/mentorship', icon: Users },
  { name: 'Digital Portfolio', path: '/portfolio', icon: Award },
  { name: 'My Profile', path: '/profile', icon: User },
];

const Sidebar = () => {
  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200/80 min-h-[calc(100vh-61px)] p-4 select-none">
      {/* Navigation List */}
      <div className="flex-1 space-y-1">
        <p className="px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">Main Navigation</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                        isActive ? 'bg-white/20 text-white' : 'bg-brand-50 text-brand-700 border border-brand-200/60'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* SIH 2026 Bottom Card */}
      <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">SIH 2026 Ready</span>
        </div>
        <h4 className="text-xs font-bold leading-snug">Problem Statement SIH26044</h4>
        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
          Academia-Industry Collaboration & Skill Mapping Engine.
        </p>
        <a
          href="http://localhost:8000/docs"
          target="_blank"
          rel="noreferrer"
          className="mt-3 flex items-center justify-between text-[11px] font-semibold text-brand-300 hover:text-white pt-2 border-t border-slate-700/60 transition-colors"
        >
          <span>Swagger Docs</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
