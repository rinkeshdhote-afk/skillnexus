import React from 'react';

const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  };

  const variantClasses = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    indigo: 'bg-indigo-50 text-indigo-700 border border-indigo-200/80',
    emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    amber: 'bg-amber-50 text-amber-800 border border-amber-200/80',
    rose: 'bg-rose-50 text-rose-700 border border-rose-200/80',
    sky: 'bg-sky-50 text-sky-700 border border-sky-200/80',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200/80',
    dark: 'bg-slate-900 text-white border border-slate-800',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full transition-colors whitespace-nowrap ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.default} ${className}`}
    >
      {children}
    </span>
  );
};

export const MatchBadge = ({ percent }) => {
  let variant = 'rose';
  if (percent >= 75) variant = 'emerald';
  else if (percent >= 50) variant = 'amber';

  return (
    <Badge variant={variant} size="md" className="font-semibold">
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
      {percent}% Match
    </Badge>
  );
};

export default Badge;
