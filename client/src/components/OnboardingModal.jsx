import { useState } from 'react';
import { useAuth } from '../context/useAuth';

const SKIN_TYPES = [
  { id: 'oily', label: 'Da Dầu', emoji: '💧', desc: 'Bóng nhờn, dễ bít tắc lỗ chân lông', border: 'hover:border-cyan-400', active: 'border-cyan-500 bg-cyan-50/60 ring-2 ring-cyan-200' },
  { id: 'dry', label: 'Da Khô', emoji: '🌵', desc: 'Căng rát, thiếu ẩm, dễ bong tróc', border: 'hover:border-amber-400', active: 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-200' },
  { id: 'combination', label: 'Da Hỗn Hợp', emoji: '⚖️', desc: 'Dầu vùng chữ T, khô hai bên má', border: 'hover:border-pink-400', active: 'border-pink-500 bg-pink-50/60 ring-2 ring-pink-200' },
  { id: 'normal', label: 'Da Thường', emoji: '✨', desc: 'Cân bằng, đàn hồi tốt, ít khuyết điểm', border: 'hover:border-emerald-400', active: 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-200' },
  { id: 'sensitive', label: 'Da Nhạy Cảm', emoji: '🌸', desc: 'Dễ đỏ rát, châm chích khi đổi mỹ phẩm', border: 'hover:border-rose-400', active: 'border-rose-500 bg-rose-50/60 ring-2 ring-rose-200' },
];

const SENSITIVITIES = [
  { id: 'low', label: 'Dịu nhẹ (Thấp)', emoji: '🌿', desc: 'Da khoẻ, ít kích ứng' },
  { id: 'medium', label: 'Trung bình', emoji: '⚡', desc: 'Đôi lúc châm chích' },
  { id: 'high', label: 'Rất nhạy cảm', emoji: '🔥', desc: 'Cực kỳ dễ mẩn đỏ' },
];

const CONCERNS = [
  { id: 'acne', label: 'Mụn viêm / Mụn ẩn', emoji: '🫧' },
  { id: 'pigmentation', label: 'Thâm mụn & Nám tàn nhang', emoji: '☀️' },
  { id: 'aging', label: 'Nếp nhăn & Lão hóa', emoji: '⏳' },
  { id: 'pores', label: 'Lỗ chân lông to & Sợi bã nhờn', emoji: '🎯' },
  { id: 'sensitivity', label: 'Dễ kích ứng & Đỏ rát', emoji: '🌸' },
  { id: 'dullness', label: 'Da xỉn màu, mệt mỏi', emoji: '🌙' },
];

const GOALS = [
  { id: 'hydration', label: 'Cấp ẩm căng mọng Glass Skin', emoji: '💧' },
  { id: 'acne_control', label: 'Làm sạch sâu & Ngừa mụn', emoji: '🫧' },
  { id: 'brightening', label: 'Làm sáng & Bật tone đều màu', emoji: '✨' },
  { id: 'anti_aging', label: 'Chống lão hóa & Tăng đàn hồi', emoji: '🌟' },
  { id: 'barrier_repair', label: 'Củng cố hàng rào bảo vệ da', emoji: '🛡️' },
];

export default function OnboardingModal({ isOpen, onClose }) {
  const { user, updateSkinProfile } = useAuth();
  const [skinType, setSkinType] = useState(() => user?.skinProfile?.skinType || 'normal');
  const [sensitivityLevel, setSensitivityLevel] = useState(
    () => user?.skinProfile?.sensitivityLevel || 'medium'
  );
  const [concerns, setConcerns] = useState(() => user?.skinProfile?.concerns || []);
  const [goals, setGoals] = useState(() => user?.skinProfile?.goals || []);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleConcern = (id) => {
    setConcerns((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleGoal = (id) => {
    setGoals((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await updateSkinProfile({
        skinType,
        sensitivityLevel,
        concerns,
        goals,
      });
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        err.message ||
        'Không thể lưu hồ sơ. Vui lòng thử lại!';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-modal-title"
    >
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Colorful top accent bar */}
        <div className="h-2.5 w-full bg-gradient-to-r from-rose-400 via-amber-300 to-pink-500 shrink-0" />

        {/* Modal Header */}
        <div className="p-6 sm:p-8 pb-4 border-b border-rose-100/70 flex items-center justify-between shrink-0">
          <div>
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-700 mb-1">
              <span>🧖‍♀️</span>
              <span>Khảo sát làn da cá nhân</span>
            </span>
            <h2 id="onboarding-modal-title" className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Cá nhân hóa chu trình của riêng bạn ✨
            </h2>
          </div>
          {user?.skinProfile?.isOnboarded && (
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm font-bold transition cursor-pointer"
              aria-label="Đóng cửa sổ"
            >
              &times;
            </button>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 pt-4 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3 text-rose-700 text-xs font-semibold flex items-center space-x-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Skin Type */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-2 flex items-center space-x-1.5">
              <span>1️⃣</span>
              <span>Loại da của bạn thuộc nhóm nào?</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SKIN_TYPES.map((type) => {
                const selected = skinType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSkinType(type.id)}
                    className={`text-left p-3.5 rounded-2xl border text-sm transition-all duration-200 cursor-pointer flex items-start space-x-3 ${
                      selected
                        ? `${type.active} shadow-xs scale-[1.01]`
                        : `border-slate-200 ${type.border} text-slate-700 hover:bg-slate-50/60`
                    }`}
                  >
                    <span className="text-2xl mt-0.5">{type.emoji}</span>
                    <div>
                      <p className="font-extrabold text-slate-900">{type.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{type.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Sensitivity */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-2 flex items-center space-x-1.5">
              <span>2️⃣</span>
              <span>Độ nhạy cảm của làn da?</span>
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {SENSITIVITIES.map((item) => {
                const selected = sensitivityLevel === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSensitivityLevel(item.id)}
                    className={`p-3 rounded-2xl border text-center transition-all duration-200 cursor-pointer ${
                      selected
                        ? 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-200 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50/60'
                    }`}
                  >
                    <span className="text-xl block mb-1">{item.emoji}</span>
                    <p className="font-bold text-xs sm:text-sm">{item.label}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 hidden sm:block">
                      {item.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Concerns */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-2 flex items-center space-x-1.5">
              <span>3️⃣</span>
              <span>Vấn đề da bạn đang quan tâm nhất? (Chọn nhiều)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {CONCERNS.map((item) => {
                const selected = concerns.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleConcern(item.id)}
                    className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer ${
                      selected
                        ? 'bg-rose-500 text-white border-rose-500 shadow-sm shadow-rose-200 scale-105'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-rose-300 hover:bg-rose-50/30'
                    }`}
                  >
                    <span>{item.emoji}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Goals */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-2 flex items-center space-x-1.5">
              <span>4️⃣</span>
              <span>Mục tiêu chăm sóc da của bạn? (Chọn nhiều)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {GOALS.map((item) => {
                const selected = goals.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleGoal(item.id)}
                    className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer ${
                      selected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-200 scale-105'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30'
                    }`}
                  >
                    <span>{item.emoji}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-extrabold text-sm rounded-2xl shadow-md shadow-rose-200 transition-all duration-200 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Đang lưu hồ sơ làn da...' : 'Lưu hồ sơ da của tôi 💖'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
