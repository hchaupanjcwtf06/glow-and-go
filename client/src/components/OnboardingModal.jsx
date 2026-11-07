import { useState } from 'react';
import { useAuth } from '../context/useAuth';

const SKIN_TYPES = [
  { id: 'oily', label: 'Da dầu', desc: 'Bóng nhờn, dễ bít tắc lỗ chân lông' },
  { id: 'dry', label: 'Da khô', desc: 'Căng rát, thiếu ẩm, dễ bong tróc' },
  { id: 'combination', label: 'Da hỗn hợp', desc: 'Dầu vùng chữ T, khô hai bên má' },
  { id: 'normal', label: 'Da thường', desc: 'Cân bằng, đàn hồi tốt, ít khuyết điểm' },
  { id: 'sensitive', label: 'Da nhạy cảm', desc: 'Dễ đỏ rát, châm chích với tác nhân ngoài' },
];

const SENSITIVITIES = [
  { id: 'low', label: 'Thấp', desc: 'Da khỏe, hiếm khi phản ứng với mỹ phẩm' },
  { id: 'medium', label: 'Trung bình', desc: 'Đôi lúc châm chích với hoạt chất mạnh' },
  { id: 'high', label: 'Cao', desc: 'Rất nhạy cảm, dễ kích ứng hoặc mẩn đỏ' },
];

const CONCERNS = [
  { id: 'acne', label: 'Mụn viêm / Mụn ẩn' },
  { id: 'pigmentation', label: 'Thâm mụn & Đốm nâu' },
  { id: 'aging', label: 'Nếp nhăn & Lão hóa' },
  { id: 'pores', label: 'Lỗ chân lông to' },
  { id: 'sensitivity', label: 'Dễ mẩn đỏ / Kích ứng' },
  { id: 'dullness', label: 'Xỉn màu & Thiếu sức sống' },
];

const GOALS = [
  { id: 'hydration', label: 'Cấp ẩm sâu & Căng mọng' },
  { id: 'acne_control', label: 'Ngăn ngừa & Giảm mụn' },
  { id: 'brightening', label: 'Làm sáng & Đều màu da' },
  { id: 'anti_aging', label: 'Tăng độ đàn hồi & Trẻ hóa' },
  { id: 'barrier_repair', label: 'Phục hồi hàng rào bảo vệ da' },
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
        'Failed to save skin profile. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-modal-title"
    >
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 mb-1">
              Khảo sát hồ sơ làn da
            </span>
            <h2 id="onboarding-modal-title" className="text-xl font-bold text-slate-900">
              Cá nhân hóa chu trình của bạn
            </h2>
          </div>
          {user?.skinProfile?.isOnboarded && (
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md text-lg leading-none"
              aria-label="Đóng cửa sổ"
            >
              &times;
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {error && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Section 1: Skin Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              1. Loại da của bạn là gì?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SKIN_TYPES.map((type) => {
                const selected = skinType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSkinType(type.id)}
                    className={`text-left p-3 rounded-xl border text-sm transition cursor-pointer ${
                      selected
                        ? 'border-rose-500 bg-rose-50/70 text-rose-900 ring-2 ring-rose-200'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <p className="font-semibold">{type.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{type.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Sensitivity */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              2. Mức độ nhạy cảm của da?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SENSITIVITIES.map((item) => {
                const selected = sensitivityLevel === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSensitivityLevel(item.id)}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                      selected
                        ? 'border-rose-500 bg-rose-50/70 text-rose-900 ring-2 ring-rose-200'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <p className="font-semibold text-xs sm:text-sm">{item.label}</p>
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
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              3. Vấn đề da bạn đang quan tâm nhất? (Chọn nhiều)
            </label>
            <div className="flex flex-wrap gap-2">
              {CONCERNS.map((item) => {
                const selected = concerns.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleConcern(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                      selected
                        ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Goals */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              4. Mục tiêu cải thiện làn da của bạn? (Chọn nhiều)
            </label>
            <div className="flex flex-wrap gap-2">
              {GOALS.map((item) => {
                const selected = goals.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleGoal(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                      selected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-semibold text-sm rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Đang lưu hồ sơ...' : 'Hoàn tất hồ sơ da'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
