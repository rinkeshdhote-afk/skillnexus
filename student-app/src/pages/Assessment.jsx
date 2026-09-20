import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import Card from '../components/Card';
import Badge from '../components/Badge';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Award,
  Sparkles,
  RotateCcw,
  TrendingUp,
  Brain,
} from 'lucide-react';

const Assessment = () => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const { refreshUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await assessmentApi.getQuestions();
      // Take a balanced sample of ~15-20 questions for an engaging demo quiz
      const shuffled = [...res.data].sort(() => 0.5 - Math.random());
      setQuestions(shuffled.slice(0, 15));
    } catch (err) {
      toast.error('Failed to load assessment questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optionIndex) => {
    const currentQ = questions[currentIndex];
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(selectedAnswers).length < questions.length) {
      if (!window.confirm('You have unanswered questions. Do you want to submit anyway?')) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await assessmentApi.submitAssessment(selectedAnswers);
      setResult(res.data);
      await refreshUser();
      toast.success('Assessment evaluated! Your skill profile has been updated.');
    } catch (err) {
      toast.error(err.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-600">Loading your personalized assessment...</p>
      </div>
    );
  }

  // --- RESULTS SCREEN WITH RECHARTS RADARCHART ---
  if (result) {
    const radarData = Object.entries(result.skills_scored || {}).map(([skill, level]) => ({
      skill,
      level,
      fullMark: 5,
    }));

    return (
      <div className="max-w-3xl mx-auto py-8 sm:py-12 px-4">
        <Card className="text-center p-8 sm:p-10 border-brand-200 shadow-xl relative overflow-hidden">
          {/* Top badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-4 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>Assessment Completed</span>
          </div>

          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Your Skill Assessment Matrix</h2>
          <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
            {result.message}
          </p>

          {/* Radar Chart */}
          <div className="my-8 h-80 w-full flex items-center justify-center">
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: '#334155', fontSize: 12, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 10 }} />
                  <Radar
                    name="Skill Level"
                    dataKey="level"
                    stroke="#4f46e5"
                    fill="#6366f1"
                    fillOpacity={0.45}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-400">Skill data updated in your profile.</p>
            )}
          </div>

          {/* Scored skills pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {Object.entries(result.skills_scored || {}).map(([skill, lvl]) => (
              <span
                key={skill}
                className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold flex items-center gap-1.5 border border-slate-200"
              >
                <span>{skill}:</span>
                <span className="text-brand-600 font-bold">Level {lvl}/5</span>
              </span>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/skill-gap')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <TrendingUp className="w-4 h-4" />
              <span>View Target Role Skill Gap</span>
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold flex items-center justify-center gap-2 transition-all"
            >
              <span>Back to Dashboard</span>
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // --- ACTIVE QUIZ QUESTION SCREEN ---
  const currentQ = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);
  const selectedOption = selectedAnswers[currentQ?.id];

  return (
    <div className="max-w-3xl mx-auto py-8 sm:py-12 px-4">
      {/* Progress Bar & Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span className="text-brand-600">{progressPercent}% Completed</span>
        </div>
        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-600 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <Card className="p-6 sm:p-8 border-slate-200/80 shadow-card">
        {/* Question Metadata */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="indigo" size="md">
              <Brain className="w-3.5 h-3.5" />
              <span>{currentQ?.skill}</span>
            </Badge>
            <Badge variant={currentQ?.category === 'soft' ? 'purple' : 'default'} size="md">
              {currentQ?.category === 'soft' ? 'Soft Skill' : 'Technical'}
            </Badge>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {Object.keys(selectedAnswers).length} answered
          </span>
        </div>

        {/* Question Prompt */}
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug mb-6">
          {currentQ?.question}
        </h2>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {currentQ?.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            return (
              <div
                key={idx}
                onClick={() => handleSelectOption(idx)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  isSelected
                    ? 'border-brand-600 bg-brand-50/60 shadow-sm text-slate-900 font-semibold'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-sm">{opt}</span>
                </div>
                {isSelected && <CheckCircle2 className="w-5 h-5 text-brand-600 flex-shrink-0" />}
              </div>
            );
          })}
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/10 flex items-center gap-2 transition-all active:scale-95"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{submitting ? 'Evaluating...' : 'Submit Assessment'}</span>
            </button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Assessment;
