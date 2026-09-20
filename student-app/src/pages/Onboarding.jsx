import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import Card from '../components/Card';
import { Target, Compass, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

const TARGET_ROLES = [
  { id: 'Full Stack Developer', label: 'Full Stack Developer', desc: 'React, Node.js, REST APIs, SQL, Git' },
  { id: 'Data Analyst', label: 'Data Analyst', desc: 'Python, SQL, Statistics, Data Viz, Excel' },
  { id: 'Machine Learning Engineer', label: 'Machine Learning Engineer', desc: 'Python, Deep Learning, ML Algorithms, Math' },
  { id: 'Cloud Engineer', label: 'Cloud Engineer', desc: 'Cloud Computing, Docker, Kubernetes, Linux' },
  { id: 'Cybersecurity Analyst', label: 'Cybersecurity Analyst', desc: 'Network Security, Linux, Cryptography' },
  { id: 'UI/UX Designer', label: 'UI/UX Designer', desc: 'Figma, Wireframing, User Research, Design Systems' },
  { id: 'Business Analyst', label: 'Business Analyst', desc: 'SQL, Business Intelligence, Problem Solving' },
];

const Onboarding = () => {
  const { user, updateLocalUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState('Full Stack Developer');
  const [interests, setInterests] = useState(user?.student_profile?.interests || 'Web development, open source');
  const [saving, setSaving] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const handleFinish = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success(`Target role set to ${selectedRole}!`);
      navigate('/assessment');
    }, 400);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 sm:py-12 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold mb-3 border border-brand-200/60">
          <Compass className="w-3.5 h-3.5" />
          <span>Step 1 of 2: Career Alignment</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Set Your Career Target</h1>
        <p className="text-sm text-slate-600 mt-2 max-w-lg mx-auto">
          SKILLNEXUS customizes your skill gap benchmarks, recommended courses, and internship matches based on your desired industry role.
        </p>
      </div>

      <Card className="mb-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-brand-600" />
          <span>Select Your Primary Career Goal</span>
        </h3>

        <div className="grid sm:grid-cols-2 gap-3">
          {TARGET_ROLES.map((role) => {
            const isSelected = selectedRole === role.id;
            return (
              <div
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-brand-600 bg-brand-50/50 shadow-md shadow-brand-500/10'
                    : 'border-slate-200/80 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-slate-900 text-sm">{role.label}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />}
                </div>
                <p className="text-xs text-slate-500 mt-2 font-medium">{role.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Interests textarea */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Specific Technical Interests & Goals
          </label>
          <textarea
            rows={2}
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="e.g. Building distributed microservices, open-source AI models, hackathon collaboration..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          Skip to Dashboard
        </button>

        <button
          onClick={handleFinish}
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold shadow-lg shadow-brand-600/20 flex items-center gap-2 transition-all active:scale-95"
        >
          <span>Continue to Skill Assessment</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
