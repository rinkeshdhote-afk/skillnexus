import React, { useState, useEffect } from 'react';
import { studentApi } from '../services/api';
import Card, { CardHeader } from '../components/Card';
import Badge from '../components/Badge';
import {
  FolderClock,
  Building2,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Clock,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

const COLUMNS = [
  { id: 'applied', label: 'Applied', color: 'bg-slate-100 text-slate-700' },
  { id: 'shortlisted', label: 'Shortlisted', color: 'bg-amber-50 text-amber-800' },
  { id: 'interview', label: 'Interview Round', color: 'bg-indigo-50 text-indigo-800' },
  { id: 'selected', label: 'Offer Extended', color: 'bg-emerald-50 text-emerald-800' },
];

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await studentApi.getMyApplications();
      setApplications(res.data);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <FolderClock className="w-7 h-7 text-brand-600" />
          <span>My Applications & Placement Pipeline</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Track stage-by-stage application progress and review recruiter and mentor feedback.
        </p>
      </div>

      {/* Kanban Columns */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-96 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {COLUMNS.map((col) => {
            const colApps = applications.filter((a) => a.status === col.id);
            return (
              <div key={col.id} className="bg-slate-100/70 rounded-2xl p-4 border border-slate-200/80">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                      {col.label}
                    </span>
                    <span className="w-5 h-5 rounded-full bg-white text-slate-700 text-[11px] font-bold flex items-center justify-center shadow-xs">
                      {colApps.length}
                    </span>
                  </div>
                </div>

                {/* Cards in Column */}
                <div className="space-y-3">
                  {colApps.map((app) => {
                    const opp = app.opportunity;
                    return (
                      <div
                        key={app.id}
                        className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {opp?.type || 'Internship'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{opp?.title}</h4>
                        <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mt-1 mb-2">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span>{opp?.company}</span>
                        </div>

                        <div className="text-[11px] font-bold text-slate-700 mb-2">
                          {opp?.stipend_or_salary}
                        </div>

                        {/* Mentor Feedback Box */}
                        {app.mentor_feedback && (
                          <div className="mt-3 p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 text-indigo-950">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 mb-1">
                              <MessageSquare className="w-3 h-3" />
                              <span>Mentor Feedback</span>
                            </div>
                            <p className="text-[11px] leading-relaxed font-medium">
                              "{app.mentor_feedback}"
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {colApps.length === 0 && (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      No applications in this stage.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Applications;
