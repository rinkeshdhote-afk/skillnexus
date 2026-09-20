import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Briefcase, Users, Award } from 'lucide-react';

const mobileNavItems = [
  { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Skill Gap', path: '/skill-gap', icon: TrendingUp },
  { name: 'Jobs', path: '/opportunities', icon: Briefcase },
  { name: 'Mentors', path: '/mentorship', icon: Users },
  { name: 'Portfolio', path: '/portfolio', icon: Award },
];

const BottomNav = () => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-brand-600 font-bold scale-105'
                    : 'text-slate-500 hover:text-slate-900 font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-lg ${isActive ? 'bg-brand-50' : ''}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] tracking-tight mt-0.5">{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
