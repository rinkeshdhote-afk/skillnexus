import React, { useState, useEffect } from 'react';
import { collaborationApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import Card, { CardHeader } from '../components/Card';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { Handshake, Plus, Building2, User, Send, Check } from 'lucide-react';

const TYPES = [
  { id: 'guest_lecture', label: 'Guest Lecture / Masterclass' },
  { id: 'live_project', label: 'Live Industry Capstone Project' },
  { id: 'innovation_challenge', label: 'Hackathon / Innovation Challenge' },
  { id: 'curriculum_review', label: 'BOS Curriculum Industry Review' },
  { id: 'fdp', label: 'Faculty Development Program (FDP)' },
];

const Collaboration = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'live_project',
    title: '',
    description: '',
    institution_or_company: '',
  });

  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const res = await collaborationApi.list();
      setProposals(res.data);
    } catch (err) {
      toast.error('Failed to load collaboration proposals.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await collaborationApi.create({
        ...formData,
        institution_or_company: formData.institution_or_company || user?.organization || 'Partner',
      });
      toast.success('Collaboration proposal submitted!');
      setModalOpen(false);
      fetchProposals();
    } catch (err) {
      toast.error(err.message || 'Submission failed.');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await collaborationApi.updateStatus(id, status);
      toast.success(`Proposal marked as ${status}!`);
      fetchProposals();
    } catch (err) {
      toast.error(err.message || 'Status update failed.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Handshake className="w-7 h-7 text-pro-600" />
            <span>Academia-Industry Collaboration Hub</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Propose joint capstones, guest lectures, curriculum alignment, and faculty development.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-pro-600 hover:bg-pro-700 text-white text-xs font-bold shadow-md shadow-pro-600/20 flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Collaboration Proposal</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : proposals.length > 0 ? (
        <div className="space-y-3">
          {proposals.map((prop) => (
            <Card key={prop.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge variant="teal" size="sm">
                    {prop.type.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <Badge variant={prop.status === 'accepted' ? 'emerald' : 'default'} size="sm">
                    {prop.status.toUpperCase()}
                  </Badge>
                </div>

                <h3 className="text-base font-bold text-slate-900">{prop.title}</h3>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    {prop.proposer_name} ({prop.proposer_role})
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Building2 className="w-3 h-3 text-slate-400" />
                    {prop.institution_or_company}
                  </span>
                </div>

                <p className="text-xs text-slate-600 max-w-2xl leading-relaxed pt-1">{prop.description}</p>
              </div>

              {prop.status === 'open' && (
                <button
                  onClick={() => handleUpdateStatus(prop.id, 'accepted')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors flex-shrink-0"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Accept Proposal</span>
                </button>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center text-slate-400">
          <Handshake className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          <h3 className="text-sm font-bold text-slate-800">No active collaboration proposals</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">Post a project or seminar topic to invite university faculty.</p>
        </Card>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Propose Industry-Academia Collaboration"
        subtitle="Initiate joint projects, guest workshops, or curriculum reviews"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Collaboration Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-pro-500/20 bg-white"
            >
              {TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Proposal Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Joint AI Healthcare Research Capstone Project"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-pro-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Scope & Student Deliverables
            </label>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Outline objectives, equipment/APIs provided, mentor involvement, and expected academic credits..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-pro-500/20"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-pro-600 hover:bg-pro-700 text-white text-xs font-bold shadow-md shadow-pro-600/20"
            >
              Submit Proposal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Collaboration;
