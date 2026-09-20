import React, { useState, useEffect } from 'react';
import { learningApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import Card, { CardHeader } from '../components/Card';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { GraduationCap, Plus, ExternalLink, Clock, Sparkles } from 'lucide-react';

const LearningPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newProgram, setNewProgram] = useState({
    title: '',
    provider: '',
    skills_covered: ['Python', 'Machine Learning'],
    type: 'course',
    url: '',
    duration: '4 weeks',
  });
  const [skillInput, setSkillInput] = useState('');

  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const res = await learningApi.listPrograms();
      setPrograms(res.data);
    } catch (err) {
      toast.error('Failed to load programs.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !newProgram.skills_covered.includes(skillInput.trim())) {
      setNewProgram({
        ...newProgram,
        skills_covered: [...newProgram.skills_covered, skillInput.trim()],
      });
      setSkillInput('');
    }
  };

  const handleCreateProgram = async (e) => {
    e.preventDefault();
    try {
      await learningApi.createProgram({
        ...newProgram,
        provider: newProgram.provider || user?.organization || 'Partner Institution',
      });
      toast.success('Learning program published!');
      setModalOpen(false);
      fetchPrograms();
    } catch (err) {
      toast.error(err.message || 'Creation failed.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-pro-600" />
            <span>Learning Programs & Certifications</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Publish specialized skill training modules mapped to current industry demand.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-pro-600 hover:bg-pro-700 text-white text-xs font-bold shadow-md shadow-pro-600/20 flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Program</span>
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs.map((prog) => (
            <Card key={prog.id} className="flex flex-col justify-between p-5">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="emerald" size="sm">
                    {prog.type.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {prog.duration}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 line-clamp-2">{prog.title}</h3>
                <p className="text-xs font-semibold text-pro-700 mt-0.5 mb-3">{prog.provider}</p>

                <div className="space-y-1 mb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Target Skills:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {prog.skills_covered?.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {prog.url && (
                <a
                  href={prog.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>View Program Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Publish Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Publish Learning Program"
        subtitle="Make a training module or workshop available for skill gap recommendations"
      >
        <form onSubmit={handleCreateProgram} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Program Title
            </label>
            <input
              type="text"
              required
              value={newProgram.title}
              onChange={(e) => setNewProgram({ ...newProgram, title: e.target.value })}
              placeholder="e.g. Masterclass on Distributed Systems & Cloud Microservices"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-pro-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Type
              </label>
              <select
                value={newProgram.type}
                onChange={(e) => setNewProgram({ ...newProgram, type: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-pro-500/20 bg-white"
              >
                <option value="course">Course</option>
                <option value="certification">Certification</option>
                <option value="workshop">Workshop</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Duration
              </label>
              <input
                type="text"
                required
                value={newProgram.duration}
                onChange={(e) => setNewProgram({ ...newProgram, duration: e.target.value })}
                placeholder="e.g. 6 weeks"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-pro-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Enrollment / Reference URL
            </label>
            <input
              type="url"
              value={newProgram.url}
              onChange={(e) => setNewProgram({ ...newProgram, url: e.target.value })}
              placeholder="https://nptel.ac.in or https://learn.microsoft.com"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-pro-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Skills Covered
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Add skill..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-pro-500/20"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {newProgram.skills_covered.map((s) => (
                <span key={s} className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] font-bold">
                  {s}
                </span>
              ))}
            </div>
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
              Publish
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LearningPrograms;
