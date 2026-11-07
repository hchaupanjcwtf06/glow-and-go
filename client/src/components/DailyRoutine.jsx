import { useState, useEffect } from 'react';
import api from '../services/api';
import { CITIES_LIST, UV_RISK_COLORS } from '../utils/routineConstants';

export default function DailyRoutine({ onNavigateToShelf }) {
  const [selectedCity, setSelectedCity] = useState('hcm');
  const [routineType, setRoutineType] = useState('day'); // 'day' | 'night'
  const [routineData, setRoutineData] = useState(null);
  const [environment, setEnvironment] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Local state for step checkboxes: { [stepIndex]: boolean }
  const [checkedSteps, setCheckedSteps] = useState({});

  useEffect(() => {
    let ignore = false;

    api
      .get(`/routine/daily?type=${routineType}&city=${selectedCity}`)
      .then((res) => {
        if (!ignore) {
          setRoutineData(res.data?.routine || null);
          setEnvironment(res.data?.environment || null);
          setIsDemo(Boolean(res.data?.isDemo));
          setError(null);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(
            err.response?.data?.error?.message ||
              err.message ||
              'Không thể tải chu trình chăm sóc da.'
          );
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [routineType, selectedCity]);

  const handleCityChange = (cityId) => {
    setSelectedCity(cityId);
    setLoading(true);
  };

  const handleRoutineTypeChange = (type) => {
    setRoutineType(type);
    setLoading(true);
  };

  // Toggle step checkbox
  const toggleStep = (stepNumber) => {
    setCheckedSteps((prev) => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  };

  const steps = routineData?.steps || [];
  const completedCount = steps.filter((s) => checkedSteps[s.stepNumber]).length;
  const progressPercent = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Environmental & Weather Header Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-7 relative overflow-hidden border border-rose-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-rose-100/70">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xl">🌤️</span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Môi trường &amp; Thời tiết hôm nay
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Chỉ số UV và chất lượng không khí định hướng chu trình bảo vệ da
            </p>
          </div>

          {/* City Selector */}
          <div className="flex items-center space-x-2">
            <label htmlFor="city-select" className="text-xs font-bold text-slate-600 shrink-0">
              Khu vực:
            </label>
            <select
              id="city-select"
              value={selectedCity}
              onChange={(e) => handleCityChange(e.target.value)}
              className="px-3.5 py-1.5 rounded-2xl bg-white border border-rose-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-400 shadow-2xs cursor-pointer"
            >
              {CITIES_LIST.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.emoji} {city.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Weather Metrics Grid */}
        {environment ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5">
            {/* Temperature */}
            <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-100 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Nhiệt độ
              </span>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-black text-slate-900">
                  {environment.temperature}&deg;C
                </span>
                <span className="text-sm font-semibold text-slate-500">
                  {environment.temperature >= 32 ? '🔥 Nóng' : '🌿 Dịu mát'}
                </span>
              </div>
            </div>

            {/* Humidity */}
            <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-100 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Độ ẩm
              </span>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-black text-slate-900">
                  {environment.humidity}%
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {environment.evaluations?.humidity?.status || 'Lý tưởng'}
                </span>
              </div>
            </div>

            {/* UV Index Badge */}
            <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-100 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Chỉ số UV
              </span>
              <div className="flex items-center space-x-1.5">
                <span className="text-2xl font-black text-slate-900">
                  {environment.uvIndex}
                </span>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                    UV_RISK_COLORS[environment.evaluations?.uv?.risk] ||
                    'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {environment.evaluations?.uv?.level || 'Bình thường'}
                </span>
              </div>
            </div>

            {/* AQI Badge */}
            <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-100 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Bụi mịn AQI
              </span>
              <div className="flex items-center space-x-1.5">
                <span className="text-2xl font-black text-slate-900">
                  {environment.aqi}
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  {environment.evaluations?.aqi?.level || 'Trung bình'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-xs text-slate-400 animate-pulse">
            Đang tải dữ liệu khí tượng...
          </div>
        )}

        {/* Environmental Skincare Guidance Pill */}
        {environment?.evaluations?.uv?.advice && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-50/80 border border-rose-100/90 text-xs text-rose-900 font-medium flex items-center space-x-2">
            <span className="text-base shrink-0">💡</span>
            <span>{environment.evaluations.uv.advice}</span>
          </div>
        )}
      </div>

      {/* Routine Type Tabs (Day vs Night) */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex space-x-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/60 max-w-md w-full">
          <button
            type="button"
            onClick={() => handleRoutineTypeChange('day')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition-all duration-200 cursor-pointer flex items-center justify-center space-x-1.5 ${
              routineType === 'day'
                ? 'bg-white text-amber-700 shadow-sm border border-amber-100'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>☀️</span>
            <span>Routine Buổi Sáng</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoutineTypeChange('night')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition-all duration-200 cursor-pointer flex items-center justify-center space-x-1.5 ${
              routineType === 'night'
                ? 'bg-white text-indigo-700 shadow-sm border border-indigo-100'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🌙</span>
            <span>Routine Buổi Tối</span>
          </button>
        </div>

        {onNavigateToShelf && (
          <button
            type="button"
            onClick={onNavigateToShelf}
            className="hidden sm:inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 shadow-2xs transition cursor-pointer"
          >
            <span>🧴</span>
            <span>Mở kệ mỹ phẩm &rarr;</span>
          </button>
        )}
      </div>

      {/* Safety Conflict Notices */}
      {routineData?.safetyNotices?.map((notice, idx) => (
        <div
          key={idx}
          className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1 shadow-2xs ${
            notice.type === 'warning'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : notice.type === 'caution'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-indigo-50 border-indigo-200 text-indigo-900'
          }`}
        >
          <div className="flex items-center space-x-2 font-black text-sm">
            <span>{notice.type === 'warning' ? '⚠️' : notice.type === 'caution' ? '🛡️' : 'ℹ️'}</span>
            <span>{notice.title}</span>
          </div>
          <p className="text-xs font-normal opacity-90 pl-6">{notice.message}</p>
        </div>
      ))}

      {/* Weather Adaptive Tips */}
      {routineData?.weatherTips?.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {routineData.weatherTips.map((tip, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-cyan-50/70 border border-cyan-200/70 text-xs text-cyan-950 flex items-start space-x-2 shadow-2xs"
            >
              <span className="text-base shrink-0">{tip.icon}</span>
              <div>
                <span className="font-bold block text-[11px] text-cyan-800 uppercase tracking-wider mb-0.5">
                  {tip.badge}
                </span>
                <p className="text-slate-700">{tip.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Demo Notification Banner */}
      {isDemo && (
        <div className="p-3 rounded-2xl bg-purple-50/80 border border-purple-200/80 text-xs text-purple-900 flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <span>✨</span>
            <span>
              <strong>Chế độ dùng thử:</strong> Chu trình đang được hiển thị từ bộ mỹ phẩm mẫu khoa học để bạn trải nghiệm trực quan.
            </span>
          </span>
          {onNavigateToShelf && (
            <button
              type="button"
              onClick={onNavigateToShelf}
              className="text-xs font-bold text-purple-700 underline hover:text-purple-900 ml-2 shrink-0 cursor-pointer"
            >
              Xem kệ mỹ phẩm
            </button>
          )}
        </div>
      )}

      {/* Progress Bar & Checklist Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-7 border border-rose-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h4 className="text-base sm:text-lg font-black text-slate-900">
              {routineData?.title || 'Chu trình chăm sóc da'}
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              Đánh dấu các bước bạn đã hoàn thành hôm nay
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
              {completedCount} / {steps.length} bước ({progressPercent}%)
            </span>
          </div>
        </div>

        {/* Progress Track */}
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300 h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Celebration Banner when 100% completed */}
        {steps.length > 0 && completedCount === steps.length && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center space-x-3 animate-in fade-in duration-300">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="text-sm font-black">Xuất sắc! Bạn đã hoàn thành chu trình hôm nay!</p>
              <p className="font-normal text-emerald-700 mt-0.5">
                Duy trì đều đặn mỗi ngày là bí quyết quan trọng nhất để làn da luôn rạng rỡ và khỏe mạnh.
              </p>
            </div>
          </div>
        )}

        {/* Routine Steps Checklist */}
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 animate-pulse space-y-2">
            <span className="text-2xl block">🧴</span>
            <p>Đang tính toán chu trình skincare tối ưu...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        ) : steps.length === 0 ? (
          <div className="py-10 text-center space-y-3">
            <span className="text-3xl block">🧴</span>
            <p className="text-sm font-bold text-slate-700">Chưa có sản phẩm nào cho buổi này</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Hãy thêm mỹ phẩm vào kệ để hệ thống tự động sắp xếp theo từng bước khoa học.
            </p>
            {onNavigateToShelf && (
              <button
                type="button"
                onClick={onNavigateToShelf}
                className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold shadow-xs hover:bg-rose-600 cursor-pointer"
              >
                + Thêm sản phẩm vào kệ
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {steps.map((step) => {
              const isChecked = Boolean(checkedSteps[step.stepNumber]);

              return (
                <div
                  key={step.stepNumber}
                  onClick={() => toggleStep(step.stepNumber)}
                  className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start space-x-4 ${
                    isChecked
                      ? 'bg-emerald-50/60 border-emerald-200 ring-1 ring-emerald-200'
                      : 'bg-white/90 hover:bg-white border-slate-200/80 hover:border-rose-200 shadow-2xs'
                  }`}
                >
                  {/* Step Checkbox */}
                  <div className="pt-0.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleStep(step.stepNumber)}
                      className="w-5 h-5 rounded-lg border-slate-300 text-emerald-500 focus:ring-emerald-400 cursor-pointer"
                    />
                  </div>

                  {/* Step Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        Bước {step.stepNumber}
                      </span>
                      <span className="text-sm">{step.icon}</span>
                      <h5
                        className={`text-sm font-extrabold truncate ${
                          isChecked ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {step.categoryLabel}
                      </h5>
                    </div>

                    {/* Matched Product */}
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className="font-bold text-xs text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg">
                        {step.product.brand ? `${step.product.brand} - ` : ''}
                        {step.product.name}
                      </span>

                      {step.product.activeIngredients?.length > 0 && (
                        <span className="text-[10px] text-slate-500 font-medium">
                          ✨ {step.product.activeIngredients.slice(0, 3).join(', ')}
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-[11px] text-slate-400 leading-snug">
                      {step.description}
                    </p>
                  </div>

                  {/* Check status badge */}
                  <div className="shrink-0 pt-0.5">
                    {isChecked ? (
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                        ✓ Đã thoa
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        Chờ thoa
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Medical & Wellness Disclaimer */}
        <div className="pt-4 border-t border-rose-100/70 text-center">
          <p className="text-[11px] text-slate-400 italic">
            🌿 {routineData?.disclaimer || 'Gợi ý mang tính tham khảo chăm sóc da thường ngày.'}
          </p>
        </div>
      </div>
    </div>
  );
}
