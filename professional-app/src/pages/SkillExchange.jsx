import React, { useState, useEffect } from 'react';
import { mentorshipApi } from '../services/api';
import { useToast } from '../components/Toast';
import Card, { CardHeader } from '../components/Card';
import Badge from '../components/Badge';
import { Repeat, Check, X, User } from 'lucide-react';

const SkillExchange = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await mentorshipApi.getSkillExchangeRequests();
      setRequests(res.data);
    } catch (err) {
      toast.error('Failed to load skill exchange requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, status) => {
    try {
      await mentorshipApi.updateSkillExchange(id, status);
      toast.success(`Request ${status}!`);
      fetchRequests();
    } catch (err) {
      toast.error(err.message || 'Action failed.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Repeat className="w-7 h-7 text-pro-600" />
          <span>Skill Exchange Collaborations</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review peer skill trade proposals sent by students eager to learn from your industry expertise.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : requests.length > 0 ? (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={req.status === 'accepted' ? 'emerald' : req.status === 'rejected' ? 'rose' : 'amber'}
                    size="sm"
                  >
                    {req.status.toUpperCase()}
                  </Badge>
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {req.student_name}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Student Offers</span>
                    <span className="font-semibold text-slate-800">{req.offered_skill}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 block">Wants to Learn</span>
                    <span className="font-semibold text-emerald-950">{req.requested_skill}</span>
                  </div>
                </div>

                {req.note && (
                  <p className="text-xs text-slate-500 italic leading-relaxed">"{req.note}"</p>
                )}
              </div>

              {req.status === 'pending' && (
                <div className="flex items-center gap-2 flex-shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <button
                    onClick={() => handleUpdate(req.id, 'accepted')}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={() => handleUpdate(req.id, 'rejected')}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center text-slate-400">
          <Repeat className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          <h3 className="text-sm font-bold text-slate-800">No skill exchange requests</h3>
          <p className="text-xs text-slate-500 mt-1">Incoming exchange requests from students will appear here.</p>
        </Card>
      )}
    </div>
  );
};

export default SkillExchange;
