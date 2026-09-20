import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyticsApi, proOpportunityApi, mentorshipApi } from '../services/api';
import Card, { CardHeader } from '../components/Card';
import Badge from '../components/Badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Briefcase,
  Users,
  Calendar,
  Sparkles,
  TrendingUp,
  PlusCircle,
  Search,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

const Dashboard = () => {
  const { user, isAcademician, subRole } = useAuth();
  const [overview, setOverview] = useState(null);
  const [skillDemand, setSkillDemand] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [overRes, demandRes] = await Promise.all([
        analyticsApi.getOverview(),
        analyticsApi.getSkillDemand(),
      ]);
      setOverview(overRes.data);
      setSkillDemand(demandRes.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const funnelData = [
    { stage: 'Applied', count: overview?.placement_funnel?.applied || 33, fill: '#64748b' },
    { stage: 'Shortlisted', count: overview?.placement_funnel?.shortlisted || 12, fill: '#f59e0b' },
    { stage: 'Interview', count: overview?.placement_funnel?.interview || 7, fill: '#0d9488' },
    { stage: 'Selected', count: overview?.placement_funnel?.selected || 2, fill: '#059669' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold mb-3 border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isAcademician ? 'Academic Faculty Suite' : subRole === 'recruiter' ? 'Talent Acquisition Suite' : 'Industry Mentor Hub'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome, {user?.name || 'Partner'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              Managing collaborations for <span className="text-white font-semibold">{user?.organization}</span>.
              Review AI-matched applicants and published opportunities.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/post-opportunity"
              className="px-5 py-3 rounded-2xl bg-pro-600 hover:bg-pro-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-pro-600/30 flex items-center gap-2 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post New Opportunity</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Postings</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 block">
            {overview?.total_opportunities || 25}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Live across India</span>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Applicants</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 block">
            {overview?.total_applications || 33}
          </span>
          <span className="text-[11px] text-teal-600 font-semibold mt-1 block">Assessed & verified</span>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Students Registered</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 block">
            {overview?.total_students || 15}
          </span>
          <span className="text-[11px] text-indigo-600 font-semibold mt-1 block">Avg Readiness {overview?.average_readiness_score || 68}%</span>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Offers Extended</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 block">
            {overview?.placement_funnel?.selected || 2}
          </span>
          <span className="text-[11px] text-amber-600 font-semibold mt-1 block">Placements finalized</span>
        </Card>
      </div>

      {/* Funnel & Skill Demand Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Placement Funnel Chart */}
        <Card className="lg:col-span-6 p-6">
          <CardHeader
            title="Candidate Placement Funnel"
            subtitle="Real-time status conversion from initial application to final offer"
          />
          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="stage" tick={{ fill: '#475569', fontSize: 11 }} />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Demanded Skills by Opportunities */}
        <Card className="lg:col-span-6 p-6 flex flex-col justify-between">
          <div>
            <CardHeader
              title="Top Skills in Demand"
              subtitle="Frequency of technical skills required across open industry postings"
              action={
                <Link to="/analytics" className="text-xs font-bold text-pro-600 hover:underline">
                  Full Report
                </Link>
              }
            />
            <div className="space-y-2.5 mt-4">
              {skillDemand.slice(0, 5).map((item) => (
                <div key={item.skill} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800">{item.skill}</span>
                    <span className="text-slate-500">{item.count} openings ({item.percentage}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-pro-600 rounded-full"
                      style={{ width: `${Math.min(item.percentage * 1.5, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/talent-search"
            className="mt-6 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Search Talent Pool by In-Demand Skills</span>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
