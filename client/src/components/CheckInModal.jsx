import { useState } from 'react';
import api from '../services/api';
import { RATING_LEVELS, FEELING_OPTIONS } from '../utils/checkInConstants';

function CheckInForm({ routineType = 'day', completedStepsCount = 0, onClose, onSaved }) {
  const [rating, setRating] = useState(4);
  const [selectedFeelings, setSelectedFeelings] = useState(['ẩm mượt']);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const toggleFeeling = (id) => {
    setSelectedFeelings((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        rating,
        feelings: selectedFeelings,
        notes: notes.trim(),
        routineType,
        completedStepsCount: Number(completedStepsCount) || 0,
      };

      const res = await api.post('/checkins', payload);
      if (onSaved) {
        onSaved(res.data?.checkIn);
      }
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
          err.message ||
          'Không thể lưu check-in. Vui lòng thử lại!'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden my-6 max-h-[90vh] flex flex-col">
      {/* Top Gradient Banner */}
      <div className="h-2.5 w-full bg-gradient-to-r from-pink-400 via-rose-400 to-amber-300 shrink-0" />

      {/* Header */}
      <div className="p-6 pb-4 border-b border-rose-100/70 flex items-center justify-between shrink-0">
        <div>
          <span className="inline-flex items-center space-x-1 px-3 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-rose-100 text-rose-700 mb-1">
            <span>{routineType === 'night' ? '🌙' : '☀️'}</span>
            <span>Check-in {routineType === 'night' ? 'Buổi Tối' : 'Buổi Sáng'}</span>
          </span>
          <h3 id="checkin-modal-title" className="text-lg font-black text-slate-900">
            Hôm nay làn da của bạn cảm thấy thế nào? ✨
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm font-bold transition cursor-pointer"
          aria-label="Đóng cửa sổ"
        >
          &times;
        </button>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-6 pt-4 overflow-y-auto space-y-5 flex-1">
        {error && (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Rating Level Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Mức độ hài lòng của làn da
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {RATING_LEVELS.map((item) => {
              const isSelected = rating === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setRating(item.value)}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                    isSelected
                      ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-200 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white'
                  }`}
                >
                  <span className="text-2xl block mb-1">{item.emoji}</span>
                  <span className="text-[10px] font-black text-slate-700 leading-tight">
                    {item.value} ⭐
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-center text-xs font-bold text-rose-600">
            {RATING_LEVELS.find((l) => l.value === rating)?.label}
          </p>
        </div>

        {/* Feelings Tag Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Cảm nhận chi tiết (Chọn một hoặc nhiều)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {FEELING_OPTIONS.map((f) => {
              const isSelected = selectedFeelings.includes(f.id);
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => toggleFeeling(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-rose-500 text-white border-rose-500 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes Textarea */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Ghi chú thêm (Tùy chọn)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Cảm nhận sau khi bôi serum/kem dưỡng, tình trạng vùng chữ T..."
            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-rose-400 bg-slate-50/50 focus:bg-white"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-black text-xs rounded-2xl shadow-md shadow-rose-200 transition disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Đang lưu nhật ký...' : 'Lưu nhật ký làn da ✨'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CheckInModal({ isOpen, onClose, onSaved, routineType, completedStepsCount }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkin-modal-title"
    >
      <CheckInForm
        key={routineType}
        routineType={routineType}
        completedStepsCount={completedStepsCount}
        onClose={onClose}
        onSaved={onSaved}
      />
    </div>
  );
}
