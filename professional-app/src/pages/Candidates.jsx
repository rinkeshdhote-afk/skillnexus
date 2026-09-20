import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { proOpportunityApi } from '../services/api';
import { useToast } from '../components/Toast';
import Card, { CardHeader } from '../components/Card';
import Badge, { MatchBadge } from '../components/Badge';
import Modal from '../components/Modal';
import {
  UserCheck,
  Building2,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Clock,
  Send,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';

const STATUS_CONFIG = {
  applied: { label: 'Applied', color: 'bg-slate-100 text-slate-700' },
  shortlisted: { label: 'Shortlisted', color: 'bg-amber-50 text-amber-800' },
  interview: { label: 'Interview Scheduled', color: 'bg-indigo-50 text-indigo-800' },
  selected: { label: 'Selected / Offer Extended', color: 'bg-emerald-50 text-emerald-800' },
  rejected: { label: 'Rejected', color: 'bg-rose-50 text-rose-700' },
};

const Candidates = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [opportunities, setOpportunities] = useState([]);
  const [selectedOppId, setSelectedOppId] = useState(searchParams.get('oppId') || '');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetCandidate, setTargetCandidate] = useState(null);
  const [statusUpdateForm, setStatusUpdateForm] = useState({
    status: 'shortlisted',
    mentor_feedback: '',
  });

  const toast = useToast();

  useEffect(() => {
    loadOpportunities();
  }, []);

  useEffect(() => {
    if (selectedOppId) {
      loadCandidates(selectedOppId);
    }
  }, [selectedOppId]);

  const loadOpportunities = async () => {
    try {
      const res = await proOpportunityApi.list();
      setOpportunities(res.data);
      if (!selectedOppId && res.data.length > 0) {
        setSelectedOppId(res.data[0].id.toString());
      }
    } catch (err) {
      toast.error('Failed to load opportunities.');
    }
  };

  const loadCandidates = async (oppId) => {
    setLoading(true);
    try {
      const res = await proOpportunityApi.getCandidates(oppId);
      setCandidates(res.data);
    } catch (err) {
      toast.error('Failed to load candidate matches.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatusModal = (candidate, defaultStatus) => {
    setTargetCandidate(candidate);
    setStatusUpdateForm({
      status: defaultStatus,
      mentor_feedback: candidate.mentor_feedback || '',
    });
    setStatusModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!targetCandidate) return;
    try {
      await proOpportunityApi.updateApplicationStatus(targetCandidate.application_id, statusUpdateForm);
      toast.success(`Application updated to ${statusUpdateForm.status}! Feedback notified to student.`);
      setStatusModalOpen(false);
      loadCandidates(selectedOppId);
    } catch (err) {
      toast.error(err.message || 'Failed to update status.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-pro-600" />
            <span>AI Candidate Shortlisting & Match Ranking</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Applicants ranked in real-time by cosine similarity between required and student verified skills.
          </p>
        </div>

        {/* Posting Dropdown */}
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Opportunity:</span>
          <select
            value={selectedOppId}
            onChange={(e) => {
              setSelectedOppId(e.target.value);
              setSearchParams({ oppId: e.target.value });
            }}
            className="text-xs sm:text-sm font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer max-w-xs"
          >
            {opportunities.map((opp) => (
              <option key={opp.id} value={opp.id}>
                #{opp.id} - {opp.title} ({opp.company})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Candidate List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : candidates.length > 0 ? (
        <div className="space-y-3">
          {candidates.map((cand, idx) => {
            const currentStatus = STATUS_CONFIG[cand.status] || STATUS_CONFIG.applied;

            return (
              <Card key={cand.application_id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900">{cand.student_name}</h3>
                      <MatchBadge percent={cand.match_percent} />
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${currentStatus.color}`}>
                        {currentStatus.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>{cand.student_email}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                        {cand.degree} in {cand.branch} ({cand.year})
                      </span>
                      <span>•</span>
                      <span>{cand.college}</span>
                    </div>

                    {/* Skills Breakdown */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Verified Proficiency Levels:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(cand.skills || {}).map(([s, lvl]) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-semibold border border-slate-200"
                          >
                            {s}: <strong className="text-pro-700">Lvl {lvl}/5</strong>
                          </span>
                        ))}
                      </div>
                    </div>

                    {cand.mentor_feedback && (
                      <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-indigo-950 text-xs">
                        <span className="font-bold text-[10px] uppercase text-indigo-700 block mb-0.5">
                          Latest Feedback:
                        </span>
                        <span>"{cand.mentor_feedback}"</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Buttons */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 flex-shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <button
                      onClick={() => handleOpenStatusModal(cand, 'shortlisted')}
                      className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 transition-colors"
                    >
                      Shortlist
                    </button>
                    <button
                      onClick={() => handleOpenStatusModal(cand, 'interview')}
                      className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold border border-indigo-200 transition-colors"
                    >
                      Schedule Interview
                    </button>
                    <button
                      onClick={() => handleOpenStatusModal(cand, 'selected')}
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
                    >
                      Extend Offer
                    </button>
                    <button
                      onClick={() => handleOpenStatusModal(cand, 'rejected')}
                      className="px-2.5 py-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
                      title="Reject candidate"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center text-slate-400">
          <UserCheck className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          <h3 className="text-sm font-bold text-slate-800">No applicants for this opportunity yet</h3>
          <p className="text-xs text-slate-500 mt-1">Students will appear here ranked by match % once they apply.</p>
        </Card>
      )}

      {/* Status & Feedback Modal */}
      {targetCandidate && (
        <Modal
          isOpen={statusModalOpen}
          onClose={() => setStatusModalOpen(false)}
          title={`Update Status: ${targetCandidate.student_name}`}
          subtitle={`Current Match: ${targetCandidate.match_percent}%`}
        >
          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Application Stage
              </label>
              <select
                value={statusUpdateForm.status}
                onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, status: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-pro-500/20 bg-white"
              >
                <option value="applied">Applied</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interview">Interview Scheduled</option>
                <option value="selected">Selected (Offer Extended)</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mentor / Recruiter Feedback Note (Visible to student)
              </label>
              <textarea
                rows={3}
                required
                value={statusUpdateForm.mentor_feedback}
                onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, mentor_feedback: e.target.value })}
                placeholder="e.g. Excellent grasp of React & REST APIs. Invited to technical round 2 on Thursday at 3 PM IST."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-pro-500/20 focus:border-pro-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setStatusModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-pro-600 hover:bg-pro-700 text-white text-xs font-bold shadow-md shadow-pro-600/20 flex items-center gap-2 transition-all active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Save Status & Feedback</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Candidates;
