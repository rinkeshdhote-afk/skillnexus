import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

const SkillChip = ({ name, level, status = 'default', requiredLevel = null, className = '' }) => {
  // status: 'met' | 'missing' | 'default'
  const isMet = status === 'met';
  const isMissing = status === 'missing';

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
        isMet
          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
          : isMissing
          ? 'bg-rose-50/80 border-rose-200 text-rose-900'
          : 'bg-slate-50 border-slate-200 text-slate-800'
      } ${className}`}
    >
      {isMet && <Check className="w-3.5 h-3.5 text-emerald-600" />}
      {isMissing && <AlertCircle className="w-3.5 h-3.5 text-rose-500" />}
      <span className="font-semibold">{name}</span>

      {level !== undefined && level !== null && (
        <span
          className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
            isMet
              ? 'bg-emerald-100 text-emerald-800'
              : isMissing
              ? 'bg-rose-100 text-rose-800'
              : 'bg-indigo-100 text-indigo-800'
          }`}
        >
          Lvl {level}{requiredLevel ? `/${requiredLevel}` : '/5'}
        </span>
      )}
    </div>
  );
};

export default SkillChip;
