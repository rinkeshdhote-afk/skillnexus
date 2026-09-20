import React, { useState, useEffect } from 'react';
import { mentorshipApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import Card, { CardHeader } from '../components/Card';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import {
  Calendar,
  Clock,
  Plus,
  CheckCircle2,
  User,
  MessageSquare,
  Send,
} from 'lucide-react';

const Mentorship = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [targetSlot, setTargetSlot] = useState(null);
  const [newSlotForm, setNewSlotForm] = useState({
    topic: 'Cracking Full-Stack Architecture Interviews',
    datetime: 'Next Saturday at 4:00 PM IST',
  });
  const [feedbackText, setFeedbackText] = useState('');

  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const res = await mentorshipApi.getMySlots();
      setSlots(res.data);
    } catch (err) {
      toast.error('Failed to load mentorship slots.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    try {
      await mentorshipApi.createSlot(newSlotForm);
      toast.success('Mentorship availability slot published!');
      setCreateModalOpen(false);
      fetchSlots();
    } catch (err) {
      toast.error(err.message || 'Failed to create slot.');
    }
  };

  const handleCompleteSession = async (e) => {
    e.preventDefault();
    if (!targetSlot) return;
    try {
      await mentorshipApi.completeSlot(targetSlot.id, feedbackText);
      toast.success('Session marked completed and feedback sent to student!');
      setCompleteModalOpen(false);
      fetchSlots();
    } catch (err) {
      toast.error(err.message || 'Failed to complete session.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-7 h-7 text-pro-600" />
            <span>Mentorship Availability & Sessions</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Host 1-on-1 career discussions, resume reviews, and technical mock rounds for students.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-pro-600 hover:bg-pro-700 text-white text-xs font-bold shadow-md shadow-pro-600/20 flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Availability Slot</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : slots.length > 0 ? (
        <div className="space-y-3">
          {slots.map((slot) => {
            const isBooked = slot.status === 'booked';
            const isCompleted = slot.status === 'completed';
            return (
              <Card key={slot.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={isCompleted ? 'emerald' : isBooked ? 'indigo' : 'default'}
                      size="sm"
                    >
                      {slot.status.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {slot.datetime}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{slot.topic}</h3>

                  {slot.student_name && (
                    <div className="text-xs text-slate-600 flex items-center gap-1.5 font-semibold">
                      <User className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Booked by: {slot.student_name}</span>
                    </div>
                  )}

                  {slot.feedback && (
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-900 text-xs mt-2 border border-emerald-100">
                      <span className="font-bold block text-[10px] uppercase text-emerald-700">Feedback provided:</span>
                      <span>"{slot.feedback}"</span>
                    </div>
                  )}
                </div>

                {isBooked && (
                  <button
                    onClick={() => {
                      setTargetSlot(slot);
                      setFeedbackText('');
                      setCompleteModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-pro-600 hover:bg-pro-700 text-white text-xs font-bold transition-colors flex-shrink-0"
                  >
                    Mark Completed & Review
                  </button>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center text-slate-400">
          <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          <h3 className="text-sm font-bold text-slate-800">No availability slots added yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">Set your upcoming free hours to mentor students.</p>
        </Card>
      )}

      {/* Add Slot Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Mentorship Slot"
        subtitle="Offer an open discussion slot for student guidance"
      >
        <form onSubmit={handleCreateSlot} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Discussion Topic / Scope
            </label>
            <input
              type="text"
              required
              value={newSlotForm.topic}
              onChange={(e) => setNewSlotForm({ ...newSlotForm, topic: e.target.value })}
              placeholder="e.g. Preparing for Tier-1 Product Engineering Interviews"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-pro-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Date & Time Slot
            </label>
            <input
              type="text"
              required
              value={newSlotForm.datetime}
              onChange={(e) => setNewSlotForm({ ...newSlotForm, datetime: e.target.value })}
              placeholder="e.g. Saturday at 5:00 PM IST"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-pro-500/20"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-pro-600 hover:bg-pro-700 text-white text-xs font-bold shadow-md shadow-pro-600/20"
            >
              Publish Slot
            </button>
          </div>
        </form>
      </Modal>

      {/* Complete & Leave Feedback Modal */}
      {targetSlot && (
        <Modal
          isOpen={completeModalOpen}
          onClose={() => setCompleteModalOpen(false)}
          title={`Complete Session with ${targetSlot.student_name}`}
          subtitle={`Topic: ${targetSlot.topic}`}
        >
          <form onSubmit={handleCompleteSession} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Student Feedback & Action Items
              </label>
              <textarea
                rows={3}
                required
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Share key strengths, areas for technical improvement, and recommended next steps..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-pro-500/20"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCompleteModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-pro-600 hover:bg-pro-700 text-white text-xs font-bold shadow-md"
              >
                Submit Feedback & Close
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Mentorship;
