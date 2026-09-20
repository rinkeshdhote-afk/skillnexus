import React, { useState, useEffect } from 'react';
import { learningApi, studentApi } from '../services/api';
import Card, { CardHeader } from '../components/Card';
import Badge from '../components/Badge';
import {
  GraduationCap,
  ExternalLink,
  BookOpen,
  Filter,
  CheckCircle,
  Clock,
  Award,
} from 'lucide-react';

const Learning = () => {
  const [programs, setPrograms] = useState([]);
  const [skillGap, setSkillGap] = useState(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [progRes, gapRes] = await Promise.all([
        learningApi.getPrograms(),
        studentApi.getSkillGap('Full Stack Developer'),
      ]);
      setPrograms(progRes.data);
      setSkillGap(gapRes.data);
    } catch (err) {
      console.error('Error loading programs:', err);
    } finally {
      setLoading(false);
    }
  };

  const missingSkillNames = new Set(
    (skillGap?.missing_skills || []).map((s) => s.skill.toLowerCase())
  );

  const filteredPrograms = programs.filter((p) => {
    if (typeFilter && p.type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-brand-600" />
            <span>Learning Hub & Upskilling Pathways</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Industry & Government accredited courses (NPTEL, SWAYAM, Google, AWS) mapped to your skill gaps.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          {['', 'course', 'certification', 'workshop'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                typeFilter === t
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {t === '' ? 'All Programs' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-60 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredPrograms.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPrograms.map((prog) => {
            const coversMissing = prog.skills_covered?.some((s) =>
              missingSkillNames.has(s.toLowerCase())
            );

            return (
              <Card key={prog.id} hover className="flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="purple" size="sm">
                      {prog.type.toUpperCase()}
                    </Badge>
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {prog.duration}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug">
                    {prog.title}
                  </h3>
                  <p className="text-xs font-bold text-brand-600 mt-1 mb-4">{prog.provider}</p>

                  {/* Skills tags */}
                  <div className="space-y-1 mb-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Skills Covered:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {prog.skills_covered?.map((s) => {
                        const isNeeded = missingSkillNames.has(s.toLowerCase());
                        return (
                          <span
                            key={s}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              isNeeded
                                ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                          >
                            {isNeeded ? '★ ' : ''}{s}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <a
                  href={prog.url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors mt-2"
                >
                  <span>Enroll on Platform</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center text-slate-500">
          <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold">No programs match this filter.</p>
        </Card>
      )}
    </div>
  );
};

export default Learning;
