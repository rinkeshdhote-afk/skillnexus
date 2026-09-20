import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../services/api';
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  BarChart3,
  Download,
  Building2,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

const COLORS = ['#10b981', '#0d9488', '#0284c7', '#6366f1', '#f59e0b', '#ec4899'];

const COLLEGE_DATA = [
  { college: 'IIT Bombay', students: 4, avgReadiness: 84.5, topGap: 'Docker', placementRate: '95%' },
  { college: 'BITS Pilani', students: 3, avgReadiness: 81.2, topGap: 'Kubernetes', placementRate: '92%' },
  { college: 'VJTI Mumbai', students: 3, avgReadiness: 76.0, topGap: 'Cloud Computing', placementRate: '88%' },
  { college: 'DTU Delhi', students: 2, avgReadiness: 72.8, topGap: 'System Design', placementRate: '86%' },
  { college: 'Anna University', students: 2, avgReadiness: 69.4, topGap: 'React', placementRate: '82%' },
];

const Analytics = () => {
  const [overview, setOverview] = useState(null);
  const [skillDemand, setSkillDemand] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [overRes, demandRes] = await Promise.all([
        analyticsApi.getOverview(),
        analyticsApi.getSkillDemand(),
      ]);
      setOverview(overRes.data);
      setSkillDemand(demandRes.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Institution,Assessed Students,Avg Placement Readiness %,Top Skill Gap,Historic Placement Rate\n';
    COLLEGE_DATA.forEach((row) => {
      csvContent += `${row.college},${row.students},${row.avgReadiness},${row.topGap},${row.placementRate}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'skillnexus_placement_analytics_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusData = overview?.applications_by_status
    ? Object.entries(overview.applications_by_status).map(([key, val]) => ({
        name: key.toUpperCase(),
        value: val,
      }))
    : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-pro-600" />
            <span>Placement & Skill Demand Analytics</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Data insights for curriculum gap calibration, placement trends, and industry skill demand.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Export Analytics CSV</span>
        </button>
      </div>

      {/* Top Demand Chart & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Skill Demand Chart */}
        <Card className="lg:col-span-8 p-6">
          <CardHeader
            title="Industry Skill Frequency Analysis"
            subtitle="Top technical skills requested across open internship & job postings"
          />
          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={skillDemand.slice(0, 8)}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="skill" tick={{ fill: '#475569', fontSize: 11 }} angle={-15} textAnchor="end" />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                  }}
                />
                <Bar dataKey="count" fill="#059669" radius={[6, 6, 0, 0]} name="Open Positions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Applications Status Donut */}
        <Card className="lg:col-span-4 p-6 flex flex-col justify-between">
          <CardHeader
            title="Application Status Ratio"
            subtitle="Pipeline distribution"
          />
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            {statusData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="font-semibold text-slate-700">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* College-wise Skill Gap Summary Table */}
      <Card className="p-6">
        <CardHeader
          title="Institutional Skill Gap & Placement Readiness Matrix"
          subtitle="Benchmarked readiness and top missing curriculum skills across affiliated colleges"
        />

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="pb-3">Institution Name</th>
                <th className="pb-3">Assessed Students</th>
                <th className="pb-3">Average Readiness</th>
                <th className="pb-3">Primary Curriculum Gap</th>
                <th className="pb-3">Placement Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {COLLEGE_DATA.map((row) => (
                <tr key={row.college} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span>{row.college}</span>
                  </td>
                  <td className="py-3.5">{row.students} Candidates</td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full"
                          style={{ width: `${row.avgReadiness}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-900">{row.avgReadiness}%</span>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200">
                      {row.topGap}
                    </span>
                  </td>
                  <td className="py-3.5 font-bold text-emerald-700">{row.placementRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Analytics;
