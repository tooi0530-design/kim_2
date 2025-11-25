import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, Loader2 } from 'lucide-react';
import { DayEntry, Mood, MOOD_EMOJIS, MOOD_LABELS } from '../types';
import { getAiAdvice } from '../services/geminiService';

interface DayModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayNumber: number;
  entry: DayEntry;
  goal: string;
  onSave: (entry: DayEntry) => void;
}

const DayModal: React.FC<DayModalProps> = ({ isOpen, onClose, dayNumber, entry, goal, onSave }) => {
  const [content, setContent] = useState(entry.content || '');
  const [selectedMood, setSelectedMood] = useState<Mood | undefined>(entry.mood);
  const [isCompleted, setIsCompleted] = useState(entry.completed || false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Reset state when modal opens for a new day
  useEffect(() => {
    if (isOpen) {
      setContent(entry.content || '');
      setSelectedMood(entry.mood);
      setIsCompleted(entry.completed || false);
      setAiAdvice(null);
    }
  }, [isOpen, entry]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      ...entry,
      dayNumber,
      content,
      mood: selectedMood,
      completed: isCompleted,
    });
    onClose();
  };

  const handleGetAdvice = async () => {
    setIsLoadingAi(true);
    const advice = await getAiAdvice(goal, selectedMood || 'neutral', dayNumber, content);
    setAiAdvice(advice);
    setIsLoadingAi(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-blue-50 p-4 border-b border-blue-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Day {dayNumber}</h2>
            <p className="text-sm text-slate-500">오늘의 기록</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-blue-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Status Toggle */}
          <div className="mb-6 flex items-center space-x-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <button
              onClick={() => setIsCompleted(!isCompleted)}
              className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${
                isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-slate-300'
              }`}
            >
              {isCompleted && <Check className="w-4 h-4" />}
            </button>
            <span className="text-slate-700 font-medium">오늘의 활동 완료</span>
          </div>

          {/* Mood Selector */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">오늘의 기분</label>
            <div className="flex justify-between gap-2 overflow-x-auto pb-2">
              {(Object.keys(MOOD_EMOJIS) as Mood[]).map((mood) => (
                <button
                  key={mood}
                  onClick={() => setSelectedMood(mood)}
                  className={`flex flex-col items-center p-2 rounded-lg transition-all min-w-[60px] ${
                    selectedMood === mood
                      ? 'bg-blue-100 ring-2 ring-blue-400 scale-105'
                      : 'hover:bg-slate-50 grayscale hover:grayscale-0'
                  }`}
                >
                  <span className="text-2xl mb-1">{MOOD_EMOJIS[mood]}</span>
                  <span className="text-xs text-slate-600">{MOOD_LABELS[mood]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Journal Area */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">기록장</label>
            <textarea
              className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none resize-none bg-slate-50 h-32 placeholder-slate-400 text-sm"
              placeholder="오늘 하루는 어땠나요? 내 마음과 건강을 위해 어떤 활동을 했나요?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* AI Coach Section */}
          <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold text-indigo-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI 코치의 조언
              </h3>
              {!aiAdvice && (
                <button
                  onClick={handleGetAdvice}
                  disabled={isLoadingAi}
                  className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-1"
                >
                  {isLoadingAi ? <Loader2 className="w-3 h-3 animate-spin" /> : '조언 받기'}
                </button>
              )}
            </div>
            
            {aiAdvice ? (
              <div className="text-sm text-indigo-900 leading-relaxed whitespace-pre-wrap animate-fade-in">
                {aiAdvice}
              </div>
            ) : (
              <p className="text-xs text-indigo-400">
                작성한 내용을 바탕으로 AI가 응원과 조언을 해드립니다.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all transform hover:scale-105 active:scale-95 text-sm font-bold"
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default DayModal;
