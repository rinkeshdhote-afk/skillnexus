import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Sparkles, ArrowRight, ShieldCheck, UserCheck, BookOpen, Rocket } from 'lucide-react';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    organization: 'IIT Bombay',
    degree: 'B.Tech',
    branch: 'Computer Science & Engineering',
    year: '3rd Year',
  });
  const [loading, setLoading] = useState(false);

  const { login, loginWithDemo, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register(formData);
        toast.success('Registration successful! Welcome to SKILLNEXUS.');
        navigate('/onboarding');
      } else {
        await login(formData.email, formData.password);
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await loginWithDemo();
      toast.success('Logged in as Demo Student (Aarav Sharma)!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Could not log in with demo account. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 flex items-center justify-center p-4 sm:p-6">
      {/* Background Decorative Glow */}
      <div className="absolute w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none -top-20 -left-20" />
      <div className="absolute w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -bottom-20 -right-20" />

      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100/10 grid lg:grid-cols-12">
        {/* Left Side: Hero Info */}
        <div className="lg:col-span-5 bg-gradient-to-br from-brand-700 via-brand-800 to-slate-950 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-brand-200 mb-6 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-brand-300" />
              <span>SIH 2026 • SIH26044 Prototype</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              SKILL<span className="text-brand-300">NEXUS</span>
            </h1>
            <p className="text-sm font-medium text-brand-100/80 mt-2">
              Empowering Indian students with AI-driven skill mapping, industry internships, and direct placement mentorship.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xs">
                  <span className="font-bold block text-white">AI Skill Matching</span>
                  <span className="text-brand-200">Cosine similarity job recommendation engine</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-xs">
                  <span className="font-bold block text-white">Curated Gap Pathways</span>
                  <span className="text-brand-200">Bridge curriculum gaps with NPTEL & SWAYAM</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-xs">
                  <span className="font-bold block text-white">Verified Mentorship</span>
                  <span className="text-brand-200">1-on-1 industry slots & peer skill exchange</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/10 text-[11px] text-brand-200/60 relative z-10">
            Designed for colleges, universities, and students across India.
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 bg-white flex flex-col justify-center">
          {/* Quick Demo Button */}
          <div className="mb-6 p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-indigo-950 block">Evaluating for SIH Jury?</span>
              <span className="text-[11px] text-indigo-700">Skip registration and jump in with pre-seeded data.</span>
            </div>
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>Use Demo Account</span>
            </button>
          </div>

          {/* Form Tabs */}
          <div className="flex border-b border-slate-100 mb-6">
            <button
              type="button"
              onClick={() => setIsRegister(false)}
              className={`pb-3 text-sm font-bold transition-colors relative mr-6 ${
                !isRegister ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign In
              {!isRegister && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" />}
            </button>
            <button
              type="button"
              onClick={() => setIsRegister(true)}
              className={`pb-3 text-sm font-bold transition-colors relative ${
                isRegister ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Register as Student
              {isRegister && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" />}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">College / University</label>
                    <input
                      type="text"
                      name="organization"
                      required
                      value={formData.organization}
                      onChange={handleInputChange}
                      placeholder="e.g. IIT Bombay"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Degree</label>
                    <select
                      name="degree"
                      value={formData.degree}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
                    >
                      <option value="B.Tech">B.Tech</option>
                      <option value="B.E.">B.E.</option>
                      <option value="B.Sc">B.Sc Computer Science</option>
                      <option value="BCA">BCA</option>
                      <option value="M.Tech">M.Tech</option>
                      <option value="MCA">MCA</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Branch</label>
                    <input
                      type="text"
                      name="branch"
                      required
                      value={formData.branch}
                      onChange={handleInputChange}
                      placeholder="e.g. Computer Science"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Year of Study</label>
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Graduated">Graduated</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="student@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Password</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
            >
              <span>{loading ? 'Authenticating...' : isRegister ? 'Create Student Account' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Cross Portal Navigation Switch */}
          <div className="mt-8 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <span>Industry Recruiter, Mentor, or Academician?</span>
            <a
              href="http://localhost:5174"
              className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1"
            >
              Open SKILLNEXUS Pro (:5174) &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
