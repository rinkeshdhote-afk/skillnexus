import React, { useState, useEffect } from 'react';
import { studentApi } from '../services/api';
import Card, { CardHeader } from '../components/Card';
import Badge from '../components/Badge';
import SkillChip from '../components/SkillChip';
import ProgressRing from '../components/ProgressRing';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Target,
  BookOpen,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

const ROLES = [
  'Full Stack Developer',
  'Data Analyst',
  'Machine Learning Engineer',
  'Cloud Engineer',
  'Cybersecurity Analyst',
  'UI/UX Designer',
  'Business Analyst',
];

const SkillGap = () => {
  const [selectedRole, setSelectedRole] = useState('Full Stack Developer');
  const [gapData, setGapData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGapData(selectedRole);
  }, [selectedRole]);

  const fetchGapData = async (role) => {
    setLoading(true);
    try {
      const res = await studentApi.getSkillGap(role);
      setGapData(res.data);
    } catch (err) {
      console.error('Error fetching skill gap:', err);
    } finally {
      setLoading(false);
    }
  };

  // Prepare BarChart data
  const chartData = [
    ...(gapData?.matched_skills || []).map((s) => ({
      skill: s.skill,
      'Your Level': s.current_level,
      'Required Benchmark': s.required_level,
      status: 'met',
    })),
    ...(gapData?.missing_skills || []).map((s) => ({
      skill: s.skill,
      'Your Level': s.current_level,
      'Required Benchmark': s.required_level,
      status: 'missing',
    })),
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Role Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-brand-600" />
            <span>Target Role Skill Gap Analysis</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Compare your assessed skills against industry standards and unlock targeted learning pathways.
          </p>
        </div>

        {/* Role Selector dropdown */}
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-slate-200 shadow-sm">
          <Target className="w-4 h-4 text-brand-600" />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="text-xs sm:text-sm font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Readiness & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Readiness Overview Ring */}
        <Card className="lg:col-span-4 flex flex-col items-center justify-center text-center p-6 sm:p-8">
          <CardHeader
            title="Readiness Benchmark"
            subtitle={`Target: ${selectedRole}`}
            className="w-full text-center"
          />
          <div className="my-4">
            <ProgressRing
              progress={gapData?.readiness_percentage || 0}
              size={140}
              strokeWidth={12}
              label="Readiness"
            />
          </div>
          <div className="w-full grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100">
            <div className="text-center p-2 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-lg font-black text-emerald-900 block">
                {gapData?.matched_skills?.length || 0}
              </span>
              <span className="text-[10px] font-bold uppercase text-emerald-700">Skills Met</span>
            </div>
            <div className="text-center p-2 rounded-xl bg-rose-50 border border-rose-200">
              <span className="text-lg font-black text-rose-900 block">
                {gapData?.missing_skills?.length || 0}
              </span>
              <span className="text-[10px] font-bold uppercase text-rose-700">Skill Gaps</span>
            </div>
          </div>
        </Card>

        {/* Recharts Bar Chart: Current vs Benchmark */}
        <Card className="lg:col-span-8 p-6">
          <CardHeader
            title="Skill Proficiency Comparison"
            subtitle="Your current verified level vs industry minimum standard (1-5)"
          />
          <div className="h-72 w-full mt-4">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="skill" tick={{ fill: '#475569', fontSize: 11 }} angle={-15} textAnchor="end" />
                  <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fill: '#475569', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Bar dataKey="Your Level" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Required Benchmark" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No skill comparison data available.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Missing Skill Chips Section */}
      <Card className="p-6">
        <CardHeader
          title="Skills Analysis Breakdown"
          subtitle="Identified gaps and met criteria for this role"
        />

        <div className="space-y-4">
          {/* Missing */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>Gaps to Bridge ({gapData?.missing_skills?.length || 0})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {gapData?.missing_skills?.map((s) => (
                <SkillChip
                  key={s.skill}
                  name={s.skill}
                  level={s.current_level}
                  requiredLevel={s.required_level}
                  status="missing"
                />
              ))}
            </div>
          </div>

          {/* Met */}
          <div className="pt-4 border-t border-slate-100">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              <span>Proficiency Benchmarks Met ({gapData?.matched_skills?.length || 0})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {gapData?.matched_skills?.map((s) => (
                <SkillChip
                  key={s.skill}
                  name={s.skill}
                  level={s.current_level}
                  requiredLevel={s.required_level}
                  status="met"
                />
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Recommended Learning Programs to Bridge Missing Skills */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-600" />
              <span>Recommended Programs Covering Missing Skills</span>
            </h2>
            <p className="text-xs text-slate-500">
              Government and Tier-1 industry accredited courses mapped directly to your gaps.
            </p>
          </div>
        </div>

        {gapData?.recommended_programs?.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gapData.recommended_programs.map((prog) => (
              <Card key={prog.id} hover className="flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="purple" size="sm">
                      {prog.type.toUpperCase()}
                    </Badge>
                    <span className="text-xs font-semibold text-slate-500">{prog.duration}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">{prog.title}</h3>
                  <p className="text-xs font-semibold text-brand-600 mt-1 mb-3">{prog.provider}</p>

                  <div className="space-y-1 mb-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Bridges Skills:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {prog.matching_needed_skills?.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded bg-brand-50 text-brand-700 text-[10px] font-bold border border-brand-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <a
                  href={prog.url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors mt-2"
                >
                  <span>Enroll in Program</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center text-slate-500">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold">
              All benchmarks met for {selectedRole}! Explore other roles above.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SkillGap;
