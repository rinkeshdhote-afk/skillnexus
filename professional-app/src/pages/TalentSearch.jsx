import React, { useState, useEffect } from 'react';
import { talentApi } from '../services/api';
import Card, { CardHeader } from '../components/Card';
import Badge from '../components/Badge';
import {
  Search,
  Filter,
  GraduationCap,
  Building2,
  ExternalLink,
  ShieldCheck,
  Star,
  Sparkles,
} from 'lucide-react';

const COMMON_SKILLS = [
  'Python', 'SQL', 'React', 'JavaScript', 'Machine Learning',
  'Cloud Computing', 'Docker', 'Data Structures', 'Git', 'Linux', 'Figma'
];

const TalentSearch = () => {
  const [skill, setSkill] = useState('Python');
  const [minLevel, setMinLevel] = useState(3);
  const [college, setCollege] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    handleSearch();
  }, [minLevel]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await talentApi.search({
        skill: skill || undefined,
        min_level: minLevel,
        college: college || undefined,
      });
      setCandidates(res.data);
    } catch (err) {
      console.error('Failed to search talent:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Search className="w-7 h-7 text-pro-600" />
          <span>Talent Sourcing & Verified Skills Search</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Search the all-India verified student database by specific technical skills and minimum competency levels.
        </p>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-5">
        <form onSubmit={handleSearch} className="grid sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              placeholder="Search skill (e.g. Python, React, SQL)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-pro-500/20"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={minLevel}
              onChange={(e) => setMinLevel(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-pro-500/20 cursor-pointer"
            >
              <option value={1}>Min Proficiency: Level 1+</option>
              <option value={2}>Min Proficiency: Level 2+</option>
              <option value={3}>Min Proficiency: Level 3+ (Competent)</option>
              <option value={4}>Min Proficiency: Level 4+ (Advanced)</option>
              <option value={5}>Min Proficiency: Level 5 (Master)</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <input
              type="text"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              placeholder="Filter by college (e.g. IIT, DTU)..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-pro-500/20"
            />
          </div>

          <div className="sm:col-span-1">
            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-pro-600 hover:bg-pro-700 text-white text-xs font-bold transition-colors flex items-center justify-center"
            >
              Filter
            </button>
          </div>
        </form>

        {/* Quick skill pills */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400">Popular:</span>
          {COMMON_SKILLS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setSkill(s);
                handleSearch();
              }}
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border transition-colors ${
                skill.toLowerCase() === s.toLowerCase()
                  ? 'bg-pro-50 text-pro-700 border-pro-200 font-bold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : candidates.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {candidates.map((stu) => (
            <Card key={stu.id} className="flex flex-col justify-between p-5">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                    {stu.name.charAt(0)}
                  </span>
                  {stu.matched_skill_level && (
                    <Badge variant="emerald" size="sm">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{skill}: Lvl {stu.matched_skill_level}/5</span>
                    </Badge>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900">{stu.name}</h3>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5 mb-2">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{stu.college}</span>
                </div>
                <div className="text-xs text-slate-600 mb-3">
                  {stu.degree} in {stu.branch} ({stu.year})
                </div>

                {/* Skills Preview */}
                <div className="space-y-1 mb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Verified Skill Levels:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(stu.skills || {}).slice(0, 5).map(([s, lvl]) => (
                      <span key={s} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                        {s}: Lvl {lvl}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {stu.portfolio?.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                    Projects ({stu.portfolio.length}):
                  </span>
                  <div className="truncate text-xs font-semibold text-pro-700">
                    {stu.portfolio[0].title}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center text-slate-400">
          <Search className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          <h3 className="text-sm font-bold text-slate-800">No candidates match this criteria</h3>
          <p className="text-xs text-slate-500 mt-1">Try lowering the minimum required proficiency level.</p>
        </Card>
      )}
    </div>
  );
};

export default TalentSearch;
