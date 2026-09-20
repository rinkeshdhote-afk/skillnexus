import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { proOpportunityApi } from '../services/api';
import { useToast } from '../components/Toast';
import Card, { CardHeader } from '../components/Card';
import { PlusCircle, X, Send, Sparkles } from 'lucide-react';

const COMMON_SKILLS = [
  'Python', 'SQL', 'React', 'JavaScript', 'Node.js', 'Machine Learning',
  'Deep Learning', 'Docker', 'Kubernetes', 'Cloud Computing', 'Git', 'Linux',
  'Figma', 'FastAPI', 'Java', 'Data Structures', 'Statistics'
];

const PostOpportunity = () => {
  const { user, isAcademician } = useAuth();
  const [formData, setFormData] = useState({
    type: 'internship',
    title: '',
    company: user?.organization || 'Partner Organization',
    description: '',
    required_skills: ['Python', 'SQL'],
    location: 'Bengaluru / Hybrid',
    mode: 'hybrid',
    stipend_or_salary: '₹40,000/month',
    deadline: '2026-11-30',
  });
  const [customSkill, setCustomSkill] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSkill = (skill) => {
    const clean = skill.trim();
    if (clean && !formData.required_skills.includes(clean)) {
      setFormData({
        ...formData,
        required_skills: [...formData.required_skills, clean],
      });
    }
    setCustomSkill('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      required_skills: formData.required_skills.filter((s) => s !== skillToRemove),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.required_skills.length === 0) {
      toast.error('Please add at least one required skill for AI matching.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await proOpportunityApi.create(formData);
      toast.success('Opportunity posted successfully! Students can now see it in recommendations.');
      navigate('/my-postings');
    } catch (err) {
      toast.error(err.message || 'Failed to post opportunity.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <PlusCircle className="w-7 h-7 text-pro-600" />
          <span>Post New Opportunity</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Publish internships, research projects, or job openings to campus students across India.
        </p>
      </div>

      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Opportunity Type */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Opportunity Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-pro-500/20 bg-white"
              >
                <option value="internship">Internship</option>
                <option value="job">Full-Time Job</option>
                <option value="apprenticeship">Apprenticeship</option>
                <option value="project">Industry Project</option>
                {isAcademician && (
                  <>
                    <option value="fdp">Faculty Development Program (FDP)</option>
                    <option value="workshop">Technical Workshop</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Work Mode
              </label>
              <select
                name="mode"
                value={formData.mode}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-pro-500/20 bg-white"
              >
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Title / Role
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g. Full Stack Engineering Intern (FastAPI & React)"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-pro-500/20 focus:border-pro-500"
            />
          </div>

          {/* Company & Location */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Organization / Company
              </label>
              <input
                type="text"
                name="company"
                required
                value={formData.company}
                onChange={handleInputChange}
                placeholder="e.g. Microsoft India"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-pro-500/20 focus:border-pro-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g. Hyderabad / Bengaluru"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-pro-500/20 focus:border-pro-500"
              />
            </div>
          </div>

          {/* Stipend & Deadline */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Stipend / CTC
              </label>
              <input
                type="text"
                name="stipend_or_salary"
                required
                value={formData.stipend_or_salary}
                onChange={handleInputChange}
                placeholder="e.g. ₹45,000/month or ₹12,00,000/year"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-pro-500/20 focus:border-pro-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Application Deadline
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-pro-500/20 focus:border-pro-500 bg-white"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Role Description & Key Responsibilities
            </label>
            <textarea
              rows={4}
              name="description"
              required
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe deliverables, technologies, and mentorship provided to the student..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-pro-500/20 focus:border-pro-500"
            />
          </div>

          {/* Required Skills (Tag Input for AI Matching) */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Required Skills (Used for AI Matching)
            </label>
            <div className="flex flex-wrap gap-1.5 p-3 rounded-xl border border-slate-200 min-h-[44px] mb-2 bg-slate-50">
              {formData.required_skills.map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-1.5"
                >
                  <span>{s}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s)}
                    className="text-emerald-700 hover:text-emerald-950"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Quick add suggestions */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] font-semibold text-slate-400">Quick add:</span>
              {COMMON_SKILLS.filter((s) => !formData.required_skills.includes(s))
                .slice(0, 6)
                .map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleAddSkill(s)}
                    className="px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200 text-[10px] font-semibold hover:bg-slate-100"
                  >
                    + {s}
                  </button>
                ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/my-postings')}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-pro-600 hover:bg-pro-700 text-white text-xs font-bold shadow-md shadow-pro-600/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Publishing...' : 'Publish Opportunity'}</span>
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default PostOpportunity;
