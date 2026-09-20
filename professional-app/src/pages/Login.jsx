import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Briefcase, ArrowRight, ShieldCheck, GraduationCap, Users, Rocket } from 'lucide-react';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'professional',
    organization: 'Microsoft India',
    designation: 'Principal Architect & Mentor',
    company: 'Microsoft India',
    years_experience: 10,
    sub_role: 'mentor',
  });
  const [loading, setLoading] = useState(false);

  const { login, loginAsMentor, loginAsAcademician, register } = useAuth();
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
        toast.success('Registration successful! Welcome to SKILLNEXUS Pro.');
        navigate('/dashboard');
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

  const handleDemoMentor = async () => {
    setLoading(true);
    try {
      await loginAsMentor();
      toast.success('Logged in as Demo Professional (Priya Nair, Microsoft)!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAcademician = async () => {
    setLoading(true);
    try {
      await loginAsAcademician();
      toast.success('Logged in as Demo Academician (Dr. Rajesh Raman, BITS Pilani)!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none -top-20 -left-20" />
      <div className="absolute w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none -bottom-20 -right-20" />

      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100/10 grid lg:grid-cols-12">
        {/* Left Side Info */}
        <div className="lg:col-span-5 bg-gradient-to-br from-pro-800 via-teal-900 to-slate-950 p-8 sm:p-10 text-white flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold mb-6 border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SIH 2026 • Pro & Academic Portal</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              SKILL<span className="text-emerald-300">NEXUS</span> <span className="text-xl text-teal-200">PRO</span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-2 leading-relaxed">
              The collaborative enterprise hub for Industry Mentors, Campus Recruiters, and University Academicians.
            </p>

            <div className="mt-8 space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-emerald-300" />
                </div>
                <div>
                  <span className="font-bold block text-white">Smart Candidate Shortlisting</span>
                  <span className="text-emerald-200/80">AI cosine match ranking & gap previews</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-teal-300" />
                </div>
                <div>
                  <span className="font-bold block text-white">Talent Search & Sourcing</span>
                  <span className="text-emerald-200/80">Filter students by verified skill levels</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <span className="font-bold block text-white">Academia Collaboration</span>
                  <span className="text-emerald-200/80">FDPs, live industrial training, and grants</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-4 border-t border-white/10 text-[11px] text-emerald-200/60">
            For students, please use the Student App on port 5173.
          </div>
        </div>

        {/* Right Side Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 bg-white flex flex-col justify-center">
          {/* 1-Click Demo Buttons for SIH Jury */}
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <span className="text-xs font-bold text-emerald-950 block mb-2">⚡ 1-Click Demo Logins for SIH Evaluation:</span>
            <div className="grid sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDemoMentor}
                disabled={loading}
                className="px-3 py-2 rounded-xl bg-pro-600 hover:bg-pro-700 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Mentor / Recruiter Demo</span>
              </button>
              <button
                type="button"
                onClick={handleDemoAcademician}
                disabled={loading}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Academician Demo</span>
              </button>
            </div>
          </div>

          {/* Form Tabs */}
          <div className="flex border-b border-slate-100 mb-6">
            <button
              type="button"
              onClick={() => setIsRegister(false)}
              className={`pb-3 text-sm font-bold transition-colors relative mr-6 ${
                !isRegister ? 'text-pro-700' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign In
              {!isRegister && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pro-600 rounded-full" />}
            </button>
            <button
              type="button"
              onClick={() => setIsRegister(true)}
              className={`pb-3 text-sm font-bold transition-colors relative ${
                isRegister ? 'text-pro-700' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Register Account
              {isRegister && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pro-600 rounded-full" />}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Role</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-pro-500/20 bg-white"
                    >
                      <option value="professional">Industry Professional</option>
                      <option value="academician">Academician / Faculty</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Focus</label>
                    <select
                      name="sub_role"
                      value={formData.sub_role}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-pro-500/20 bg-white"
                    >
                      <option value="mentor">Technical Mentor</option>
                      <option value="recruiter">Talent Recruiter</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Priya Nair"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-pro-500/20 focus:border-pro-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Company / University</label>
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
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Designation</label>
                    <input
                      type="text"
                      name="designation"
                      required
                      value={formData.designation}
                      onChange={handleInputChange}
                      placeholder="e.g. Principal Architect"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-pro-500/20 focus:border-pro-500"
                    />
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
                placeholder="mentor@company.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-pro-500/20 focus:border-pro-500"
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
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-pro-500/20 focus:border-pro-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-pro-700 hover:bg-pro-800 text-white font-bold text-sm shadow-md shadow-pro-700/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
            >
              <span>{loading ? 'Authenticating...' : isRegister ? 'Register Account' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Cross Portal Navigation Switch */}
          <div className="mt-8 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <span>Looking for Student Portal?</span>
            <a
              href="http://localhost:5173"
              className="font-bold text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1"
            >
              Open SKILLNEXUS Student (:5173) &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
