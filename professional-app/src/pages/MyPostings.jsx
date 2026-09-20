import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { proOpportunityApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import Card from '../components/Card';
import Badge from '../components/Badge';
import {
  FileText,
  Users,
  PlusCircle,
  MapPin,
  Clock,
  Trash2,
  CheckCircle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

const MyPostings = () => {
  const { user } = useAuth();
  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchPostings();
  }, []);

  const fetchPostings = async () => {
    setLoading(true);
    try {
      const res = await proOpportunityApi.list();
      setPostings(res.data);
    } catch (err) {
      toast.error('Failed to load postings.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (opp) => {
    const newStatus = opp.status === 'open' ? 'closed' : 'open';
    try {
      await proOpportunityApi.update(opp.id, { status: newStatus });
      toast.success(`Posting marked as ${newStatus}.`);
      fetchPostings();
    } catch (err) {
      toast.error(err.message || 'Status update failed.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this posting?')) return;
    try {
      await proOpportunityApi.delete(id);
      toast.success('Opportunity deleted.');
      fetchPostings();
    } catch (err) {
      toast.error(err.message || 'Failed to delete posting.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-7 h-7 text-pro-600" />
            <span>My Published Postings</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your opportunities, track incoming student applications, and shortlist candidates.
          </p>
        </div>

        <Link
          to="/post-opportunity"
          className="px-4 py-2.5 rounded-xl bg-pro-600 hover:bg-pro-700 text-white text-xs font-bold shadow-md shadow-pro-600/20 flex items-center gap-2 transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Opportunity</span>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : postings.length > 0 ? (
        <div className="space-y-3">
          {postings.map((opp) => {
            const isOpen = opp.status === 'open';
            return (
              <Card key={opp.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={isOpen ? 'emerald' : 'default'} size="sm">
                      {opp.status.toUpperCase()}
                    </Badge>
                    <Badge variant="teal" size="sm">
                      {opp.type.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-slate-400 font-medium">#{opp.id}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{opp.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{opp.company}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {opp.location} ({opp.mode})
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-slate-800">{opp.stipend_or_salary}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {opp.required_skills?.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:self-center flex-shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <Link
                    to={`/candidates?oppId=${opp.id}`}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>View Candidates</span>
                  </Link>

                  <button
                    onClick={() => handleToggleStatus(opp)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    {isOpen ? 'Close' : 'Reopen'}
                  </button>

                  <button
                    onClick={() => handleDelete(opp.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete posting"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center text-slate-400">
          <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          <h3 className="text-sm font-bold text-slate-800">No opportunities posted yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">Publish your first internship or job drive to receive AI matches.</p>
        </Card>
      )}
    </div>
  );
};

export default MyPostings;
