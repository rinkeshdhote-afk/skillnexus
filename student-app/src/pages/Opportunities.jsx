import React, { useState, useEffect } from 'react';
import { studentApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import Card from '../components/Card';
import Badge, { MatchBadge } from '../components/Badge';
import Modal from '../components/Modal';
import {
  Briefcase,
  Search,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Send,
} from 'lucide-react';

const TYPES = [
  { id: '', label: 'All Types' },
  { id: 'internship', label: 'Internships' },
  { id: 'job', label: 'Full-Time Jobs' },
  { id: 'apprenticeship', label: 'Apprenticeships' },
  { id: 'project', label: 'Funded Projects' },
  { id: 'workshop', label: 'Workshops' },
];

const MODES = [
  { id: '', label: 'Any Mode' },
  { id: 'remote', label: 'Remote' },
  { id: 'hybrid', label: 'Hybrid' },
  { id: 'onsite', label: 'Onsite' },
];

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [modeFilter, setModeFilter] = useState('');
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    loadData();
  }, [typeFilter, modeFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [oppsRes, recsRes, myAppsRes] = await Promise.all([
        studentApi.getOpportunities({
          type: typeFilter || undefined,
          mode: modeFilter || undefined,
          search: search || undefined,
        }),
        studentApi.getRecommendations(),
        studentApi.getMyApplications(),
      ]);

      setOpportunities(oppsRes.data);
      setRecommendations(recsRes.data);

      const appliedSet = new Set(myAppsRes.data.map((a) => a.opportunity_id));
      setAppliedIds(appliedSet);
    } catch (err) {
      toast.error('Failed to load opportunities.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  // Build recommendation lookup map
  const recMap = {};
  recommendations.forEach((r) => {
    recMap[r.opportunity.id] = r;
  });

  const handleApply = async (oppId) => {
    setApplying(true);
    try {
      await studentApi.applyToOpportunity(oppId);
      setAppliedIds((prev) => new Set([...prev, oppId]));
      toast.success('Application submitted successfully!');
      setSelectedOpp(null);
    } catch (err) {
      toast.error(err.message || 'Application failed.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Briefcase className="w-7 h-7 text-brand-600" />
          <span>Industry Opportunities & Placements</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Explore internships, jobs, and funded research projects ranked by your verified skill match.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <Card className="p-4 sm:p-5">
        <form onSubmit={handleSearchSubmit} className="grid sm:grid-cols-12 gap-3">
          {/* Keyword Search */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by role, company, or tech stack..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* Type Filter */}
          <div className="sm:col-span-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 cursor-pointer"
            >
              {TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Mode Filter */}
          <div className="sm:col-span-3">
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 cursor-pointer"
            >
              {MODES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </form>
      </Card>

      {/* Listings Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-60 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : opportunities.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {opportunities.map((opp) => {
            const rec = recMap[opp.id];
            const hasApplied = appliedIds.has(opp.id);
            const matchScore = rec?.match_percent || 65.0;

            return (
              <Card
                key={opp.id}
                hover
                onClick={() => setSelectedOpp(opp)}
                className="flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="default" size="sm">
                      {opp.type.toUpperCase()}
                    </Badge>
                    <MatchBadge percent={matchScore} />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 line-clamp-1">{opp.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-3">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{opp.company}</span>
                    <span>•</span>
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{opp.location}</span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                    {opp.description}
                  </p>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {opp.required_skills?.slice(0, 4).map((s) => {
                      const isMatching = rec?.matching_skills?.includes(s);
                      return (
                        <span
                          key={s}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                            isMatching
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          {isMatching ? '✓ ' : ''}{s}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{opp.stipend_or_salary}</span>
                  {hasApplied ? (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Applied</span>
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                      <span>View & Apply</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-10 text-center text-slate-500">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No opportunities match your criteria</h3>
          <p className="text-xs text-slate-500 mt-1">Try clearing filters or searching for different keywords.</p>
        </Card>
      )}

      {/* Detail Modal */}
      {selectedOpp && (
        <Modal
          isOpen={!!selectedOpp}
          onClose={() => setSelectedOpp(null)}
          title={selectedOpp.title}
          subtitle={`${selectedOpp.company} • ${selectedOpp.location} (${selectedOpp.mode})`}
        >
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="indigo">{selectedOpp.type.toUpperCase()}</Badge>
              <Badge variant="default">{selectedOpp.mode.toUpperCase()}</Badge>
              <MatchBadge percent={recMap[selectedOpp.id]?.match_percent || 70} />
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Role Overview</h4>
              <p className="text-sm text-slate-700 leading-relaxed">{selectedOpp.description}</p>
            </div>

            {/* Key details */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Compensation</span>
                <span className="text-sm font-bold text-slate-900">{selectedOpp.stipend_or_salary}</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Application Deadline</span>
                <span className="text-sm font-bold text-slate-900">{selectedOpp.deadline || 'Rolling basis'}</span>
              </div>
            </div>

            {/* Skill Match Breakdown */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Skill Fit Analysis
              </h4>
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-semibold text-emerald-700 block mb-1.5">
                    Matching Skills Verified:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {recMap[selectedOpp.id]?.matching_skills?.length > 0 ? (
                      recMap[selectedOpp.id].matching_skills.map((s) => (
                        <span key={s} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                          ✓ {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No matching skills identified</span>
                    )}
                  </div>
                </div>

                {recMap[selectedOpp.id]?.missing_skills?.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-rose-700 block mb-1.5">
                      Skills Recommended to Learn:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {recMap[selectedOpp.id].missing_skills.map((s) => (
                        <span key={s} className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200">
                          + {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedOpp(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
              {appliedIds.has(selectedOpp.id) ? (
                <div className="px-5 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Already Applied</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleApply(selectedOpp.id)}
                  disabled={applying}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{applying ? 'Submitting...' : 'Submit Application'}</span>
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Opportunities;
