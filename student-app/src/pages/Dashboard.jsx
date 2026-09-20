import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { studentApi, mentorshipApi } from '../services/api';
import Card, { CardHeader } from '../components/Card';
import Badge, { MatchBadge } from '../components/Badge';
import ProgressRing from '../components/ProgressRing';
import SkillChip from '../components/SkillChip';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  BookOpen,
  CheckSquare,
  AlertTriangle,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [skillGap, setSkillGap] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const studentProfile = user?.student_profile;
  const isAssessed = studentProfile?.assessment_done;

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [recsRes, gapRes, appsRes] = await Promise.allSettled([
        studentApi.getRecommendations(),
        studentApi.getSkillGap('Full Stack Developer'),
        studentApi.getMyApplications(),
      ]);

      if (recsRes.status === 'fulfilled') setRecommendations(recsRes.value.data);
      if (gapRes.status === 'fulfilled') setSkillGap(gapRes.value.data);
      if (appsRes.status === 'fulfilled') setApplications(appsRes.value.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const topGaps = skillGap?.missing_skills?.slice(0, 3) || [];
  const readiness = skillGap?.readiness_percentage || (isAssessed ? 72 : 25);

  // Application counts by status
  const appStats = {
    applied: applications.filter((a) => a.status === 'applied').length,
    shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
    interview: applications.filter((a) => a.status === 'interview').length,
    selected: applications.filter((a) => a.status === 'selected').length,
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Hero Greeting Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="absolute w-72 h-72 bg-brand-500/20 rounded-full blur-3xl pointer-events-none -top-10 -right-10" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-300 text-xs font-semibold mb-3 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Placement Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋
            </h1>
            <p className="text-sm text-slate-300 mt-1.5 max-w-xl">
              Enrolled in <span className="text-white font-semibold">{studentProfile?.degree || 'B.Tech'}</span> •{' '}
              <span className="text-white font-semibold">{studentProfile?.branch || 'CSE'}</span> at{' '}
              <span className="text-white font-semibold">{user?.organization || 'College'}</span>.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {!isAssessed ? (
              <Link
                to="/assessment"
                className="px-5 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-brand-600/30 flex items-center gap-2 transition-all active:scale-95"
              >
                <CheckSquare className="w-4 h-4" />
                <span>Take Skill Assessment</span>
              </Link>
            ) : (
              <Link
                to="/skill-gap"
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold backdrop-blur-sm border border-white/10 flex items-center gap-2 transition-all"
              >
                <TrendingUp className="w-4 h-4 text-brand-300" />
                <span>Analyze Skill Gaps</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Readiness Ring Card */}
        <Card className="md:col-span-4 flex flex-col items-center justify-center text-center p-6 sm:p-8">
          <CardHeader
            title="Industry Readiness"
            subtitle="Benchmark: Full Stack Developer"
            className="w-full text-center"
          />
          <div className="my-3">
            <ProgressRing progress={readiness} size={135} strokeWidth={12} label="Readiness" />
          </div>
          <p className="text-xs text-slate-500 max-w-xs mt-2">
            Based on AI evaluation of your assessed technical skills against tier-1 industry job requirements.
          </p>
          <Link
            to="/skill-gap"
            className="mt-4 text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1.5"
          >
            <span>Explore Target Role Benchmark</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>

        {/* Top Skill Gaps to Bridge */}
        <Card className="md:col-span-4 flex flex-col justify-between p-6">
          <div>
            <CardHeader
              title="Top Skill Gaps"
              subtitle="Skills most critical for your next promotion/offer"
              action={
                <Link to="/learning" className="text-xs font-bold text-brand-600 hover:underline">
                  View Courses
                </Link>
              }
            />
            {topGaps.length > 0 ? (
              <div className="space-y-3 mt-4">
                {topGaps.map((gap, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{gap.skill}</div>
                      <div className="text-[11px] text-slate-500">
                        Current: Lvl {gap.current_level} • Target: Lvl {gap.required_level}
                      </div>
                    </div>
                    <Link
                      to="/learning"
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-bold hover:bg-indigo-100 transition-colors"
                    >
                      Bridge Gap
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-semibold">No critical gaps identified for this role!</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Powered by SIH AI Rule Engine</span>
            <Link to="/assessment" className="text-brand-600 font-bold hover:underline">
              Retake Quiz
            </Link>
          </div>
        </Card>

        {/* Application Funnel Status */}
        <Card className="md:col-span-4 flex flex-col justify-between p-6">
          <div>
            <CardHeader
              title="Application Tracker"
              subtitle="Status of active internship & job drives"
              action={
                <Link to="/applications" className="text-xs font-bold text-brand-600 hover:underline">
                  My Pipeline
                </Link>
              }
            />

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                <span className="text-2xl font-black text-slate-900 block">{appStats.applied}</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Applied</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
                <span className="text-2xl font-black text-amber-900 block">{appStats.shortlisted}</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Shortlisted</span>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-center">
                <span className="text-2xl font-black text-indigo-900 block">{appStats.interview}</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">Interviews</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-2xl font-black text-emerald-900 block">{appStats.selected}</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Selected</span>
              </div>
            </div>
          </div>

          <Link
            to="/opportunities"
            className="mt-6 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold text-center block shadow-md transition-colors"
          >
            Browse Open Internships & Jobs
          </Link>
        </Card>
      </div>

      {/* "Recommended for You" - AI Cosine Ranked Opportunities */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-600" />
              <span>Recommended For You</span>
            </h2>
            <p className="text-xs text-slate-500">
              Ranked in real-time by scikit-learn cosine similarity matching your assessed skills.
            </p>
          </div>
          <Link
            to="/opportunities"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>View All ({recommendations.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.slice(0, 3).map((rec) => {
              const opp = rec.opportunity;
              return (
                <Card key={opp.id} hover className="flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant="default" size="sm">
                        {opp.type.toUpperCase()}
                      </Badge>
                      <MatchBadge percent={rec.match_percent} />
                    </div>

                    <h3 className="text-base font-bold text-slate-900 line-clamp-1">{opp.title}</h3>
                    <p className="text-xs font-semibold text-slate-500 mb-3">{opp.company} • {opp.location} ({opp.mode})</p>

                    <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                      {opp.description}
                    </p>

                    {/* Skill Breakdown */}
                    <div className="space-y-1.5 mb-4">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Matching Skills ({rec.matching_skills?.length || 0})
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {rec.matching_skills?.slice(0, 3).map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                            ✓ {s}
                          </span>
                        ))}
                        {rec.missing_skills?.slice(0, 2).map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 text-[10px] font-semibold border border-rose-200">
                            + {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{opp.stipend_or_salary}</span>
                    <Link
                      to="/opportunities"
                      className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                    >
                      <span>Details & Apply</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-8 text-center text-slate-500">
            <Briefcase className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold">No recommendations found yet. Complete an assessment to see smart matches!</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
