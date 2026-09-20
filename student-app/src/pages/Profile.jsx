import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card, { CardHeader } from '../components/Card';
import Badge from '../components/Badge';
import {
  User,
  GraduationCap,
  Award,
  Sparkles,
  CheckCircle2,
  Mail,
  Building2,
  Calendar,
  Layers,
} from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const profile = user?.student_profile;
  const skills = profile?.skills || {};

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Profile Header Hero */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-tr from-slate-900 via-brand-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-black text-3xl flex items-center justify-center shadow-lg border-2 border-white/20">
            {user?.name ? user.name.charAt(0) : 'S'}
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/10 text-brand-300 text-xs font-bold border border-white/10">
              <Sparkles className="w-3 h-3" />
              <span>Verified Student Candidate</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">{user?.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {user?.email}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {user?.organization}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Academic & Assessment Status Cards */}
      <div className="grid sm:grid-cols-2 gap-6">
        <Card className="p-6">
          <CardHeader
            title="Academic Enrollment"
            subtitle="Registered institutional details"
          />
          <div className="space-y-3 mt-4 text-xs sm:text-sm">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Degree:</span>
              <span className="font-bold text-slate-800">{profile?.degree || 'B.Tech'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Branch:</span>
              <span className="font-bold text-slate-800">{profile?.branch || 'CSE'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Year:</span>
              <span className="font-bold text-slate-800">{profile?.year || '3rd Year'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 font-medium">College:</span>
              <span className="font-bold text-slate-800 text-right">{user?.organization}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 flex flex-col justify-between">
          <div>
            <CardHeader
              title="Assessment Readiness"
              subtitle="Skill benchmarking status"
            />
            <div className="mt-4 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-indigo-950 block">
                  {profile?.assessment_done ? 'Assessment Verified' : 'Assessment Pending'}
                </span>
                <p className="text-xs text-indigo-700 mt-0.5 leading-relaxed">
                  {profile?.assessment_done
                    ? 'Your skills have been validated by SKILLNEXUS AI algorithms.'
                    : 'Take the assessment to unlock accurate opportunity rankings.'}
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/assessment"
            className="mt-6 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold text-center block shadow-md transition-colors"
          >
            {profile?.assessment_done ? 'Retake Skill Assessment' : 'Take Skill Assessment'}
          </Link>
        </Card>
      </div>

      {/* Verified Skills Matrix */}
      <Card className="p-6">
        <CardHeader
          title="Verified Skills Matrix"
          subtitle="Levels 1 to 5 evaluated through technical quizzes and project validations"
          action={
            <Link to="/assessment" className="text-xs font-bold text-brand-600 hover:underline">
              Test New Skills
            </Link>
          }
        />

        {Object.keys(skills).length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
            {Object.entries(skills).map(([skill, lvl]) => (
              <div
                key={skill}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between"
              >
                <div className="text-xs font-bold text-slate-800 truncate mb-2">{skill}</div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-semibold">Proficiency:</span>
                  <span className="font-bold text-brand-600">Lvl {lvl}/5</span>
                </div>
                {/* 5-bar progress dots */}
                <div className="grid grid-cols-5 gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full ${
                        i <= lvl ? 'bg-brand-600' : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-slate-400 text-xs">
            No skills recorded yet. Complete your first assessment!
          </div>
        )}
      </Card>
    </div>
  );
};

export default Profile;
