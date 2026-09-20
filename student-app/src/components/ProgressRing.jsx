import React from 'react';

const ProgressRing = ({ progress = 0, size = 120, strokeWidth = 10, label = 'Readiness' }) => {
  const normalizedRadius = (size - strokeWidth) / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const validProgress = Math.min(Math.max(progress, 0), 100);
  const strokeDashoffset = circumference - (validProgress / 100) * circumference;

  let strokeColor = '#4f46e5'; // brand indigo
  if (validProgress >= 75) strokeColor = '#10b981'; // emerald
  else if (validProgress >= 50) strokeColor = '#f59e0b'; // amber
  else if (validProgress > 0) strokeColor = '#f43f5e'; // rose

  return (
    <div className="relative inline-flex flex-col items-center justify-center">
      <svg height={size} width={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          stroke="#f1f5f9"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Animated Progress ring */}
        <circle
          stroke={strokeColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out' }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {Math.round(validProgress)}%
        </span>
        {label && <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">{label}</span>}
      </div>
    </div>
  );
};

export default ProgressRing;
