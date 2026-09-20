import React, { useState, useEffect } from 'react';
import { mentorshipApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import Card, { CardHeader } from '../components/Card';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import {
  Users,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowRight,
  Repeat,
  Send,
  Building2,
  CheckCircle2,
  Clock,
} from 'lucide-react';

const Mentorship = () => {
  const [mentors, setMentors] = useState([]);
  const [myExchanges, setMyExchanges] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);
  const [exchangeForm, setExchangeForm] = useState({
    professional_id: '',
    offered_skill: 'React & Frontend UI',
    requested_skill: 'Cloud Architecture & DevOps',
    note: '',
  });
  const [loading, setLoading] = useState(true);
  const [bookingSlotId, setBookingSlotId] = useState(null);
  const [submittingExchange, setSubmittingExchange] = useState(false);

  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    loadMentorsAndExchanges();
  }, []);

  const loadMentorsAndExchanges = async () => {
    setLoading(true);
    try {
      const [mentorsRes, exchRes] = await Promise.all([
        mentorshipApi.getMentors(),
        mentorshipApi.getMySkillExchanges(),
      ]);
      setMentors(mentorsRes.data);
      setMyExchanges(exchRes.data);
    } catch (err) {
      toast.error('Failed to load mentorship data.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSlot = async (slotId) => {
    setBookingSlotId(slotId);
    try {
      const res = await mentorshipApi.bookSlot(slotId);
      toast.success(res.data.message || 'Mentorship slot booked successfully!');
      loadMentorsAndExchanges();
    } catch (err) {
      toast.error(err.message || 'Booking failed.');
    } finally {
      setBookingSlotId(null);
    }
  };

  const openExchangeModal = (mentor) => {
    setSelectedMentor(mentor);
    setExchangeForm((prev) => ({
      ...prev,
      professional_id: mentor.id,
      requested_skill: mentor.expertise?.[0] || 'System Design',
    }));
    setExchangeModalOpen(true);
  };

  const handleSubmitExchange = async (e) => {
    e.preventDefault();
    setSubmittingExchange(true);
    try {
      await mentorshipApi.requestSkillExchange(exchangeForm);
      toast.success('Skill exchange request sent to mentor!');
      setExchangeModalOpen(false);
      loadMentorsAndExchanges();
    } catch (err) {
      toast.error(err.message || 'Failed to submit skill exchange.');
    } finally {
      setSubmittingExchange(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Users className="w-7 h-7 text-brand-600" />
          <span>Industry Mentors & Peer Skill Exchange</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Connect 1-on-1 with senior architects, hiring managers, and university deans.
        </p>
      </div>

      {/* Mentors Grid */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span>Verified Industry Mentors</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">
            {mentors.length} Available
          </span>
        </h2>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mentors.map((mentor) => (
              <Card key={mentor.id} className="flex flex-col justify-between p-6">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-black text-base flex items-center justify-center shadow-md shadow-brand-500/20">
                      {mentor.name.charAt(0)}
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Verified</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{mentor.name}</h3>
                  <div className="text-xs font-semibold text-brand-600 mt-0.5">{mentor.designation}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-1 mb-4">
                    <Building2 className="w-3 h-3 text-slate-400" />
                    <span>{mentor.company}</span>
                    <span>•</span>
                    <span>{mentor.years_experience} yrs exp</span>
                  </div>

                  {/* Expertise chips */}
                  <div className="space-y-1.5 mb-5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Core Expertise:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {mentor.expertise?.map((exp) => (
                        <span key={exp} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Open Slots & Action */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Upcoming Open Sessions:
                    </span>
                    {mentor.open_slots?.length > 0 ? (
                      mentor.open_slots.map((slot) => (
                        <div
                          key={slot.id}
                          className="p-2 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between gap-2"
                        >
                          <div className="truncate">
                            <span className="text-xs font-bold text-indigo-950 block truncate">{slot.topic}</span>
                            <span className="text-[10px] text-indigo-600 flex items-center gap-1 mt-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              {slot.datetime}
                            </span>
                          </div>
                          <button
                            onClick={() => handleBookSlot(slot.id)}
                            disabled={bookingSlotId === slot.id}
                            className="px-2.5 py-1 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-[11px] font-bold transition-colors disabled:opacity-50 flex-shrink-0"
                          >
                            {bookingSlotId === slot.id ? 'Booking...' : 'Book'}
                          </button>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic block">No active slots scheduled</span>
                    )}
                  </div>

                  <button
                    onClick={() => openExchangeModal(mentor)}
                    className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Repeat className="w-3.5 h-3.5 text-slate-500" />
                    <span>Propose Skill Exchange</span>
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Existing Skill Exchanges */}
      <div className="mt-8">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Repeat className="w-4 h-4 text-brand-600" />
          <span>My Skill Exchange Requests</span>
        </h2>

        {myExchanges.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {myExchanges.map((ex) => (
              <Card key={ex.id} className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-slate-900">With {ex.professional_name}</span>
                  <Badge variant={ex.status === 'accepted' ? 'emerald' : 'amber'} size="sm">
                    {ex.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 my-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">I Offer</span>
                    <span className="font-semibold text-slate-800">{ex.offered_skill}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-indigo-50">
                    <span className="text-[10px] text-indigo-500 font-bold uppercase block">I Want to Learn</span>
                    <span className="font-semibold text-indigo-950">{ex.requested_skill}</span>
                  </div>
                </div>
                {ex.note && <p className="text-xs text-slate-500 italic mt-2 leading-relaxed">"{ex.note}"</p>}
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center text-slate-400 text-xs">
            No active skill exchanges proposed yet. Pick a mentor above and propose an exchange!
          </Card>
        )}
      </div>

      {/* Skill Exchange Modal */}
      {selectedMentor && (
        <Modal
          isOpen={exchangeModalOpen}
          onClose={() => setExchangeModalOpen(false)}
          title="Propose Skill Exchange"
          subtitle={`Exchange skills and collaborate peer-to-peer with ${selectedMentor.name}`}
        >
          <form onSubmit={handleSubmitExchange} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Skill You Can Offer (Your Expertise)
              </label>
              <input
                type="text"
                required
                value={exchangeForm.offered_skill}
                onChange={(e) => setExchangeForm({ ...exchangeForm, offered_skill: e.target.value })}
                placeholder="e.g. React & Modern UI, Python Data Scraping..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Skill You Want to Learn (Mentor's Domain)
              </label>
              <input
                type="text"
                required
                value={exchangeForm.requested_skill}
                onChange={(e) => setExchangeForm({ ...exchangeForm, requested_skill: e.target.value })}
                placeholder="e.g. System Design, Kubernetes, LLMOps..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Message / Collaboration Pitch
              </label>
              <textarea
                rows={3}
                value={exchangeForm.note}
                onChange={(e) => setExchangeForm({ ...exchangeForm, note: e.target.value })}
                placeholder="Share your goals and how you'd like to collaborate during weekends or peer reviews..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setExchangeModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingExchange}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingExchange ? 'Sending...' : 'Send Request'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Mentorship;
