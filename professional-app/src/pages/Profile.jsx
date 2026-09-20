import React from 'react';
import { useAuth } from '../context/AuthContext';
import Card, { CardHeader } from '../components/Card';
import Badge from '../components/Badge';
import {
  User,
  ShieldCheck,
  Building2,
  Mail,
  Briefcase,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

const Profile = () => {
  const { user, isAcademician, subRole } = useAuth();
  const prof = user?.professional_profile;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Hero */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-tr from-slate-900 via-teal-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-pro-600 to-teal-500 text-white font-black text-3xl flex items-center justify-center shadow-lg border-2 border-white/20">
            {user?.name ? user.name.charAt(0) : 'P'}
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Industry Partner (SIH26044)</span>
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

      {/* Profile Details */}
      <div className="grid sm:grid-cols-2 gap-6">
        <Card className="p-6">
          <CardHeader title="Professional Credentials" subtitle="Verified platform identity" />
          <div className="space-y-3 mt-4 text-xs sm:text-sm">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Designation:</span>
              <span className="font-bold text-slate-800">{prof?.designation || 'Specialist'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Organization:</span>
              <span className="font-bold text-slate-800">{prof?.company || user?.organization}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Experience:</span>
              <span className="font-bold text-slate-800">{prof?.years_experience || 5} Years</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 font-medium">Account Role:</span>
              <span className="font-bold capitalize text-emerald-700">
                {isAcademician ? 'Academician' : `${subRole} (Industry)`}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6 flex flex-col justify-between">
          <div>
            <CardHeader title="Institutional Verification" subtitle="Smart India Hackathon badge" />
            <div className="mt-4 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-emerald-950 block">Tier-1 Institutional Authority</span>
                <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
                  Authorized to create open campus internships, schedule mentorship slots, and issue offer decisions.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Authentication: JWT Bearer RBAC</span>
            <span className="text-emerald-700 font-bold">Status: Active</span>
          </div>
        </Card>
      </div>

      {/* Expertise */}
      <Card className="p-6">
        <CardHeader
          title="Domain Expertise & Specializations"
          subtitle="Areas open for student mentorship and project collaborations"
        />
        <div className="flex flex-wrap gap-2 mt-4">
          {(prof?.expertise?.length > 0
            ? prof.expertise
            : ['System Design', 'Cloud Computing', 'Docker', 'Mentorship', 'Career Guidance']
          ).map((exp) => (
            <span
              key={exp}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold"
            >
              {exp}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Profile;
